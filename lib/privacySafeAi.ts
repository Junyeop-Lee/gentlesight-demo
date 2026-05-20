import {
  type ADLState,
  type AnomalyResult,
  type GuardianRole,
  type GuardianReport
} from "@/data/routineDataset";
import {
  getRoutineStateForAi,
  localizeAnomalyText,
  type Language
} from "@/lib/i18n";

export const FALLBACK_REPORT_MESSAGE =
  "현재 리포트를 생성하지 못했습니다. 감지된 생활 변화 요약을 확인해주세요.";
export const FALLBACK_SUPPORTING_SUGGESTION =
  "필요하면 기존 권장 조치에 따라 조용히 안부를 확인해주세요.";
export const FALLBACK_CHANGE_SUMMARY =
  "생활 리듬 변화는 앱의 익명 요약 기준으로만 표시됩니다.";

export type PrivacySafeChangeLevel = "stable" | "watch" | "clear_change";

export type PrivacySafeAiInput = {
  routineState: string;
  confidence: number;
  severity: AnomalyResult["severity"];
  changeLevel: PrivacySafeChangeLevel;
  role: GuardianRole;
  language: Language;
  riskScore: number;
  baselineComparison: string;
  reasonSummary: string;
  trendSummary: string;
  recommendedAction: string;
  privacyPolicyMarker: string;
};

export type PrivacySafeReportSource = "openai" | "fallback";

export type PrivacySafeReportResponse = {
  message: string;
  supportingSuggestion: string;
  changeSummary: string;
  source: PrivacySafeReportSource;
  model?: string;
  reason?:
    | "missing_api_key"
    | "provider_error"
    | "unsafe_output"
    | "invalid_output";
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};

export const blockedRawKeys = new Set([
  "appliance",
  "applianceLabel",
  "powerDelta",
  "duration",
  "waveform",
  "events",
  "time",
  "baselineTime"
]);

const blockedRawValuePatterns = [
  /\b\d{1,2}:\d{2}\b/,
  /조명|선풍기|전자레인지|냉장고|밥솥|전력|파형|타임스탬프/,
  /\b(light|fan|microwave|fridge|rice cooker|watt|watts|waveform|timestamp)\b/i
];

export function buildPrivacySafeAiInput({
  adlState,
  anomaly,
  report,
  role,
  eventCount,
  language
}: {
  adlState: ADLState;
  anomaly: AnomalyResult;
  report: GuardianReport;
  role: GuardianRole;
  eventCount: number;
  language: Language;
}): PrivacySafeAiInput {
  return {
    routineState: getRoutineStateForAi(adlState, language),
    confidence: adlState.confidence,
    severity: anomaly.severity,
    changeLevel: getChangeLevel(anomaly),
    role,
    language,
    riskScore: anomaly.gaugeValue,
    baselineComparison: summarizeBaselineComparison(anomaly, language),
    reasonSummary: localizeAnomalyText(anomaly.reasonSummary, language),
    trendSummary:
      eventCount > 0
        ? localizeAnomalyText(anomaly.currentText, language)
        : language === "ko"
          ? "생활 신호 요약 대기"
          : "Waiting for routine signal summary",
    recommendedAction: report.recommendedAction,
    privacyPolicyMarker:
      "PRIVACY_SAFE_SUMMARY_ONLY: do not include appliance names, raw timestamps, power values, waveforms, or event logs in generated reports."
  };
}

export function buildReportPrompt(input: PrivacySafeAiInput) {
  const outputLanguage =
    input.language === "ko" ? "Korean" : "English";

  return [
    `Generate a warm ${outputLanguage} guardian report from privacy-preserving routine data.`,
    "Return structured fields only: message, supportingSuggestion, and changeSummary.",
    "Do not create title, CTA, severity, score, badge, or analysis. The application owns those decisions.",
    "Keep each field short enough for a compact phone report card.",
    input.privacyPolicyMarker,
    `Routine state: ${input.routineState}`,
    `Confidence: ${input.confidence}`,
    `Severity: ${input.severity}`,
    `Change level: ${input.changeLevel}`,
    `Role: ${input.role}`,
    `Risk score: ${input.riskScore}`,
    `Baseline comparison: ${input.baselineComparison}`,
    `Reason summary: ${input.reasonSummary}`,
    `Trend summary: ${input.trendSummary}`,
    `Recommended action: ${input.recommendedAction}`
  ].join("\n");
}

export function isPrivacySafeAiInput(
  value: Partial<PrivacySafeAiInput>
): value is PrivacySafeAiInput {
  return (
    typeof value.routineState === "string" &&
    typeof value.confidence === "number" &&
    (value.severity === "normal" ||
      value.severity === "watch" ||
      value.severity === "caution") &&
    (value.changeLevel === "stable" ||
      value.changeLevel === "watch" ||
      value.changeLevel === "clear_change") &&
    (value.role === "family" || value.role === "socialWorker") &&
    (value.language === "ko" || value.language === "en") &&
    typeof value.riskScore === "number" &&
    typeof value.baselineComparison === "string" &&
    typeof value.reasonSummary === "string" &&
    typeof value.trendSummary === "string" &&
    typeof value.recommendedAction === "string" &&
    typeof value.privacyPolicyMarker === "string"
  );
}

export function findRawKeyPath(value: unknown, path: string[] = []): string | null {
  if (!value || typeof value !== "object") {
    if (
      typeof value === "string" &&
      blockedRawValuePatterns.some((pattern) => pattern.test(value))
    ) {
      return path.join(".") || "value";
    }

    return null;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findRawKeyPath(value[index], [...path, String(index)]);
      if (found) {
        return found;
      }
    }

    return null;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPath = [...path, key];
    if (blockedRawKeys.has(key)) {
      return nextPath.join(".");
    }

    const found = findRawKeyPath(nestedValue, nextPath);
    if (found) {
      return found;
    }
  }

  return null;
}

export function buildFallbackReportResponse(
  input: Pick<
    PrivacySafeAiInput,
    "language" | "role" | "severity" | "changeLevel" | "recommendedAction"
  >,
  metadata: Omit<
    PrivacySafeReportResponse,
    "message" | "supportingSuggestion" | "changeSummary" | "source"
  > & {
    source?: PrivacySafeReportSource;
  }
): PrivacySafeReportResponse {
  const isEnglish = input.language === "en";

  return {
    message: isEnglish
      ? "The report could not be generated right now. Please review the summarized living-rhythm change."
      : FALLBACK_REPORT_MESSAGE,
    supportingSuggestion: isEnglish
      ? `If needed, follow the current suggested action: ${input.recommendedAction}.`
      : FALLBACK_SUPPORTING_SUGGESTION,
    changeSummary: getFallbackChangeSummary(input),
    source: metadata.source ?? "fallback",
    model: metadata.model,
    reason: metadata.reason,
    usage: metadata.usage
  };
}

function getChangeLevel(anomaly: AnomalyResult): PrivacySafeChangeLevel {
  if (anomaly.severity === "caution") {
    return "clear_change";
  }

  if (anomaly.severity === "watch") {
    return "watch";
  }

  return "stable";
}

function summarizeBaselineComparison(
  anomaly: AnomalyResult,
  language: Language
) {
  if (language === "en") {
    if (anomaly.severity === "caution") {
      return "Clearly outside the usual routine range";
    }

    if (anomaly.lateConfirmed) {
      return "Routine was confirmed later than usual";
    }

    if (anomaly.severity === "watch") {
      return "Slightly outside the usual routine range";
    }

    return "Within the usual routine range";
  }

  if (anomaly.severity === "caution") {
    return "평소 생활 리듬 범위에서 뚜렷하게 벗어남";
  }

  if (anomaly.lateConfirmed) {
    return "평소보다 늦게 생활 리듬이 확인됨";
  }

  if (anomaly.severity === "watch") {
    return "평소 생활 리듬 범위에서 조금 벗어남";
  }

  return "평소 생활 리듬 범위 안에서 요약됨";
}

function getFallbackChangeSummary(
  input: Pick<PrivacySafeAiInput, "language" | "changeLevel" | "role">
) {
  if (input.language === "en") {
    if (input.changeLevel === "clear_change") {
      return input.role === "socialWorker"
        ? "A clear routine change is summarized for case review."
        : "A clear change from the usual routine is summarized.";
    }

    if (input.changeLevel === "watch") {
      return "A light routine change is being watched without raw device details.";
    }

    return "The current living rhythm remains within the usual range.";
  }

  if (input.changeLevel === "clear_change") {
    return input.role === "socialWorker"
      ? "케이스 확인이 필요한 생활 리듬 변화가 요약되었습니다."
      : "평소 생활 리듬과 다른 뚜렷한 변화가 요약되었습니다.";
  }

  if (input.changeLevel === "watch") {
    return "원천 기기 정보 없이 가벼운 생활 리듬 변화를 관찰 중입니다.";
  }

  return "현재 생활 리듬은 평소 범위 안에서 요약되었습니다.";
}

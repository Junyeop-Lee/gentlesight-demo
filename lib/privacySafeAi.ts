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

export type PrivacySafeAiInput = {
  routineState: string;
  confidence: number;
  severity: AnomalyResult["severity"];
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
  source: PrivacySafeReportSource;
  model?: string;
  reason?: "missing_api_key" | "provider_error" | "unsafe_output";
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
    role,
    language,
    riskScore: anomaly.gaugeValue,
    baselineComparison: localizeBaselineComparison(
      anomaly.baselineText,
      language
    ),
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
    `Generate one warm ${outputLanguage} guardian report message from privacy-preserving routine data.`,
    "Return only the message sentence or short paragraph. Do not return JSON, markdown, title, CTA, severity, or analysis.",
    input.privacyPolicyMarker,
    `Routine state: ${input.routineState}`,
    `Confidence: ${input.confidence}`,
    `Severity: ${input.severity}`,
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

function localizeBaselineComparison(value: string, language: Language) {
  if (language === "ko") {
    return value;
  }

  return value
    .replace("개인 기준선 범위와 일치", "Matches the personal baseline range")
    .replace("개인 기준선", "Personal baseline")
    .replace("기준선", "baseline");
}

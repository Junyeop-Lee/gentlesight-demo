import {
  type ADLState,
  type AnomalyResult,
  type GuardianRole,
  type GuardianReport
} from "@/data/routineDataset";

export type PrivacySafeAiInput = {
  routineState: string;
  confidence: number;
  severity: AnomalyResult["severity"];
  role: GuardianRole;
  riskScore: number;
  baselineComparison: string;
  reasonSummary: string;
  trendSummary: string;
  recommendedAction: string;
  privacyPolicyMarker: string;
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
  eventCount
}: {
  adlState: ADLState;
  anomaly: AnomalyResult;
  report: GuardianReport;
  role: GuardianRole;
  eventCount: number;
}): PrivacySafeAiInput {
  return {
    routineState: adlState.label,
    confidence: adlState.confidence,
    severity: anomaly.severity,
    role,
    riskScore: anomaly.gaugeValue,
    baselineComparison: anomaly.baselineText,
    reasonSummary: anomaly.reasonSummary,
    trendSummary: eventCount > 0 ? anomaly.currentText : "생활 신호 요약 대기",
    recommendedAction: report.recommendedAction,
    privacyPolicyMarker:
      "PRIVACY_SAFE_SUMMARY_ONLY: do not include appliance names, raw timestamps, power values, waveforms, or event logs in generated reports."
  };
}

export function buildReportPrompt(input: PrivacySafeAiInput) {
  return [
    "Generate a warm Korean guardian report from privacy-preserving routine data.",
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

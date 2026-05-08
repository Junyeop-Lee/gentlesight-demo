import {
  type ADLState,
  type AnomalyResult,
  type GuardianReport
} from "@/data/routineDataset";

export type PrivacySafeAiInput = {
  routineState: string;
  confidence: number;
  severity: AnomalyResult["severity"];
  riskScore: number;
  trendSummary: string;
  recommendedAction: string;
  privacyPolicy: string;
};

export function buildPrivacySafeAiInput({
  adlState,
  anomaly,
  report,
  eventCount
}: {
  adlState: ADLState;
  anomaly: AnomalyResult;
  report: GuardianReport;
  eventCount: number;
}): PrivacySafeAiInput {
  return {
    routineState: adlState.label,
    confidence: adlState.confidence,
    severity: anomaly.severity,
    riskScore: anomaly.gaugeValue,
    trendSummary: eventCount > 0 ? anomaly.currentText : "생활 신호 요약 대기",
    recommendedAction: report.recommendedAction,
    privacyPolicy:
      "Do not include appliance names, raw timestamps, power values, waveforms, or event logs in generated reports."
  };
}

export function buildReportPrompt(input: PrivacySafeAiInput) {
  return [
    "Generate a warm Korean guardian report from privacy-preserving routine data.",
    input.privacyPolicy,
    `Routine state: ${input.routineState}`,
    `Confidence: ${input.confidence}`,
    `Severity: ${input.severity}`,
    `Risk score: ${input.riskScore}`,
    `Trend summary: ${input.trendSummary}`,
    `Recommended action: ${input.recommendedAction}`
  ].join("\n");
}

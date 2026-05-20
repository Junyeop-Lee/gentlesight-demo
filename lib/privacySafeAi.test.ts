import { describe, expect, it } from "vitest";
import {
  buildPrivacySafeAiInput,
  findRawKeyPath,
  isPrivacySafeAiInput
} from "@/lib/privacySafeAi";
import type {
  ADLState,
  AnomalyResult,
  GuardianReport
} from "@/data/routineDataset";

const adlState: ADLState = {
  label: "아침 식사 준비 중",
  confidence: 91,
  relatedEvents: ["생활 신호 1"],
  icon: "meal"
};

const anomaly: AnomalyResult = {
  severity: "caution",
  statusLabel: "확인 필요",
  baselineText: "개인 기준선 07:50-08:20",
  currentText: "아침 생활 리듬이 아직 확인되지 않았습니다",
  reasonSummary:
    "평소 아침 활동이 시작되는 시간대가 지났지만 관련 생활 신호가 아직 요약되지 않았습니다.",
  recentSignal: "예상 시간대 이후에도 아침 생활 리듬 미확인",
  lateConfirmed: false,
  deltaMinutes: 20,
  gaugeValue: 84
};

const report: GuardianReport = {
  title: "아침 리듬 확인 필요",
  message: "가볍게 안부를 확인해보세요.",
  tone: "alert",
  recommendedAction: "전화하기",
  notificationLabel: "안부 확인 권장"
};

describe("privacy-safe AI input", () => {
  it("builds a valid bilingual privacy-safe input without raw event fields", () => {
    const input = buildPrivacySafeAiInput({
      adlState,
      anomaly,
      report,
      role: "family",
      eventCount: 1,
      language: "en"
    });

    expect(isPrivacySafeAiInput(input)).toBe(true);
    expect(input.language).toBe("en");
    expect(input.routineState).toBe("Breakfast preparation");
    expect(input.changeLevel).toBe("clear_change");
    expect(input.baselineComparison).not.toMatch(/\d{1,2}:\d{2}/);
    expect(findRawKeyPath(input)).toBeNull();
  });

  it("rejects nested raw appliance fields before provider calls", () => {
    expect(
      findRawKeyPath({
        summary: {
          safe: true,
          nested: [{ applianceLabel: "밥솥" }]
        }
      })
    ).toBe("summary.nested.0.applianceLabel");
  });

  it("requires explicit supported language and severity", () => {
    expect(
      isPrivacySafeAiInput({
        routineState: "Breakfast preparation",
        confidence: 91,
        severity: "urgent",
        changeLevel: "clear_change",
        role: "family",
        language: "en",
        riskScore: 84,
        baselineComparison: "Personal baseline 07:50-08:20",
        reasonSummary: "Delayed morning rhythm",
        trendSummary: "Needs check",
        recommendedAction: "Call",
        privacyPolicyMarker: "PRIVACY_SAFE_SUMMARY_ONLY"
      })
    ).toBe(false);
  });
});

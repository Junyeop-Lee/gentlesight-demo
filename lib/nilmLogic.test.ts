import { describe, expect, it } from "vitest";
import {
  createApplianceEvent,
  detectAnomaly,
  getBaselineProgress,
  inferAdlState
} from "@/lib/nilmLogic";
import { parseClockToMinutes } from "@/lib/simulationClock";

function at(clock: string) {
  return parseClockToMinutes(clock);
}

function progressById(
  progress: ReturnType<typeof getBaselineProgress>,
  id: string
) {
  const item = progress.find((entry) => entry.baseline.id === id);

  expect(item).toBeDefined();
  return item!;
}

describe("full-day routine interpretation", () => {
  it("interprets confirmed morning wake and breakfast signals as stable routine progress", () => {
    const events = [
      createApplianceEvent("light", 0, "08:02", 0),
      createApplianceEvent("microwave", 1, "08:18", 1)
    ];

    const adlState = inferAdlState(events, at("08:25"));
    const anomaly = detectAnomaly(events, at("08:25"));
    const progress = getBaselineProgress(events, at("08:25"));

    expect(adlState).toMatchObject({
      label: "아침 식사 준비 중",
      confidence: 84,
      icon: "meal",
      relatedEvents: ["생활 신호 1", "생활 신호 2"]
    });
    expect(anomaly).toMatchObject({
      severity: "normal",
      statusLabel: "안정",
      baselineText: "개인 기준선 07:50-08:20",
      currentText: "아침 활동 시작이 안정적으로 요약됨",
      recentSignal: "아침 식사 준비 관련 생활 신호",
      lateConfirmed: false
    });
    expect(progressById(progress, "morning-start")).toMatchObject({
      status: "confirmed",
      isCurrent: true,
      recentSignal: "활동 시작 관련 생활 신호"
    });
    expect(progressById(progress, "breakfast")).toMatchObject({
      status: "confirmed",
      recentSignal: "아침 식사 준비 관련 생활 신호"
    });
    expect(progressById(progress, "noon").status).toBe("scheduled");
  });

  it("marks a missing midday signal as a current needs-check baseline", () => {
    const currentMinutes = at("13:12");

    const adlState = inferAdlState([], currentMinutes);
    const anomaly = detectAnomaly([], currentMinutes);
    const progress = getBaselineProgress([], currentMinutes);

    expect(adlState).toMatchObject({
      label: "점심 전후 활동 미확인",
      confidence: 58,
      icon: "unknown",
      relatedEvents: []
    });
    expect(anomaly).toMatchObject({
      severity: "caution",
      statusLabel: "확인 필요",
      baselineText: "개인 기준선 11:30-12:30",
      currentText: "점심 전후 활동이 아직 확인되지 않았습니다",
      recentSignal: "점심 전후 활동 생활 리듬 미확인",
      deltaMinutes: 2
    });
    expect(progressById(progress, "noon")).toMatchObject({
      status: "needsCheck",
      isCurrent: true,
      recentSignal: "요약된 생활 신호 없음"
    });
    expect(progressById(progress, "morning-start").status).toBe("needsCheck");
    expect(progressById(progress, "night").status).toBe("scheduled");
  });

  it("interprets evening meal and rest signals as a confirmed evening routine", () => {
    const events = [
      createApplianceEvent("microwave", 0, "19:03", 0),
      createApplianceEvent("tv", 1, "19:28", 1)
    ];

    const adlState = inferAdlState(events, at("19:45"));
    const anomaly = detectAnomaly(events, at("19:45"));
    const progress = getBaselineProgress(events, at("19:45"));

    expect(adlState).toMatchObject({
      label: "저녁 루틴",
      confidence: 86,
      icon: "evening",
      relatedEvents: ["생활 신호 1", "생활 신호 2"]
    });
    expect(anomaly).toMatchObject({
      severity: "normal",
      statusLabel: "안정",
      baselineText: "개인 기준선 18:30-20:00",
      currentText: "저녁 루틴이 안정적으로 요약됨",
      recentSignal: "저녁 생활 리듬 관련 생활 신호",
      lateConfirmed: false
    });
    expect(progressById(progress, "evening")).toMatchObject({
      status: "confirmed",
      isCurrent: true,
      recentSignal: "저녁 생활 리듬 관련 생활 신호"
    });
    expect(progressById(progress, "night").status).toBe("scheduled");
  });

  it("interprets night rest signals as confirmed pre-sleep stability", () => {
    const events = [createApplianceEvent("tv", 0, "22:10", 0)];

    const adlState = inferAdlState(events, at("22:20"));
    const anomaly = detectAnomaly(events, at("22:20"));
    const progress = getBaselineProgress(events, at("22:20"));

    expect(adlState).toMatchObject({
      label: "취침 전 안정",
      confidence: 72,
      icon: "rest",
      relatedEvents: ["생활 신호 1"]
    });
    expect(anomaly).toMatchObject({
      severity: "normal",
      statusLabel: "안정",
      baselineText: "개인 기준선 21:30-22:30",
      currentText: "취침 전 안정이 안정적으로 요약됨",
      recentSignal: "취침 전 안정 관련 생활 신호",
      lateConfirmed: false
    });
    expect(progressById(progress, "night")).toMatchObject({
      status: "confirmed",
      isCurrent: true,
      recentSignal: "취침 전 안정 관련 생활 신호"
    });
    expect(progressById(progress, "evening").status).toBe("needsCheck");
  });
});

import {
  applianceCatalog,
  applianceFingerprints,
  type ADLState,
  type AnomalyResult,
  type ApplianceEvent,
  type ApplianceId,
  type GuardianReport,
  interactionSlots
} from "@/data/routineDataset";
import { getRoutinePhaseForClock } from "@/lib/simulationClock";

const applianceLabels = new Map(
  applianceCatalog.map((appliance) => [appliance.id, appliance.label])
);

export type ScenarioMode = "baseline" | "delayed";

export function createApplianceEvent(
  applianceId: ApplianceId,
  eventIndex: number,
  currentTime: string,
  phaseEventIndex: number
): ApplianceEvent {
  const phase = getRoutinePhaseForClock(currentTime);
  const phaseSlots = interactionSlots.filter((slot) => slot.phase === phase);
  const slot =
    phaseSlots[Math.min(phaseEventIndex, phaseSlots.length - 1)] ??
    interactionSlots[Math.min(eventIndex, interactionSlots.length - 1)];
  const fingerprint = applianceFingerprints[applianceId];
  const label = applianceLabels.get(applianceId) ?? applianceId;

  return {
    id: `${slot.id}-${applianceId}-${eventIndex}`,
    appliance: applianceId,
    applianceLabel: label,
    time: currentTime,
    baselineTime: slot.time,
    phase,
    ...fingerprint
  };
}

export function inferAdlState(events: ApplianceEvent[]): ADLState {
  if (events.length === 0) {
    return {
      label: "활동 대기",
      confidence: 0,
      relatedEvents: [],
      icon: "unknown"
    };
  }

  const latest = events[events.length - 1];
  const phaseEvents = events.filter((event) => event.phase === latest.phase);
  const relatedSignals = phaseEvents.map((_, index) => `생활 신호 ${index + 1}`);
  const mealSignals = phaseEvents.filter(
    (event) => event.adlSignal === "meal"
  ).length;
  const restSignals = phaseEvents.filter(
    (event) => event.adlSignal === "rest"
  ).length;
  const householdSignals = phaseEvents.filter(
    (event) => event.adlSignal === "household"
  ).length;
  const wakeSignals = phaseEvents.filter(
    (event) => event.adlSignal === "wake"
  ).length;

  if (latest.phase === "morning" && mealSignals + wakeSignals >= 2) {
    return {
      label: "아침 식사 준비 중",
      confidence: clampConfidence(66 + phaseEvents.length * 9),
      relatedEvents: relatedSignals,
      icon: "meal"
    };
  }

  if (latest.phase === "noon" && restSignals >= 1) {
    return {
      label: "휴식 중",
      confidence: clampConfidence(70 + restSignals * 12 + mealSignals * 5),
      relatedEvents: relatedSignals,
      icon: "rest"
    };
  }

  if (latest.phase === "evening" && mealSignals + restSignals >= 2) {
    return {
      label: "저녁 루틴",
      confidence: clampConfidence(72 + phaseEvents.length * 7),
      relatedEvents: relatedSignals,
      icon: "evening"
    };
  }

  if (householdSignals > 0) {
    return {
      label: "가사 활동",
      confidence: clampConfidence(62 + householdSignals * 15),
      relatedEvents: relatedSignals,
      icon: "household"
    };
  }

  return {
    label: "생활 신호 감지",
    confidence: clampConfidence(58 + phaseEvents.length * 7),
    relatedEvents: relatedSignals,
    icon: latest.adlSignal === "rest" ? "rest" : "unknown"
  };
}

export function detectAnomaly(
  events: ApplianceEvent[],
  scenarioMode: ScenarioMode
): AnomalyResult {
  if (events.length === 0) {
    return {
      severity: "normal",
      baselineText: "평소 루틴 기준선을 준비 중",
      currentText: "아직 요약된 생활 신호가 없습니다",
      deltaMinutes: 0,
      gaugeValue: 6
    };
  }

  const morningEvents = events.filter((event) => event.phase === "morning");
  if (scenarioMode === "delayed" && morningEvents.length > 0) {
    const firstMorning = morningEvents[0];
    const deltaMinutes = minutesBetween(firstMorning.baselineTime, firstMorning.time);

    if (deltaMinutes > 20) {
      return {
        severity: "caution",
        baselineText: "평소 아침 루틴보다 늦은 시작",
        currentText: "오늘 첫 생활 신호가 늦게 요약됨",
        deltaMinutes,
        gaugeValue: Math.min(88, 45 + Math.round(deltaMinutes / 2))
      };
    }
  }

  const latest = events[events.length - 1];
  if (latest.phase === "night") {
    return {
      severity: "watch",
      baselineText: "평소 야간 활동은 22시 이전에 마무리",
      currentText: "야간 루틴 변화가 요약됨",
      deltaMinutes: 18,
      gaugeValue: 42
    };
  }

  return {
    severity: "normal",
    baselineText: "평소 루틴 범위와 일치",
    currentText: "생활 흐름이 안정적으로 요약됨",
    deltaMinutes: 0,
    gaugeValue: 20 + Math.min(events.length * 4, 18)
  };
}

export function generateGuardianReport(
  adlState: ADLState,
  anomaly: AnomalyResult,
  latestEvent?: ApplianceEvent
): GuardianReport {
  if (!latestEvent) {
    return {
      title: "GentleSight 대기",
      message:
        "생활 신호가 익명 요약되면 일상 상태와 안부 리포트가 자동으로 생성됩니다.",
      tone: "calm",
      recommendedAction: "루틴 모니터링"
    };
  }

  if (anomaly.severity === "caution") {
    return {
      title: "아침 루틴 지연 감지",
      message:
        "어머니가 평소보다 조금 늦게 일어나셨네요. 따뜻한 안부 전화 한 통 어떨까요?",
      tone: "warm",
      recommendedAction: "안부 전화 걸기"
    };
  }

  if (adlState.icon === "meal") {
    return {
      title: "식사 준비 확인",
      message: `${adlState.label} 상태로 요약되었습니다. 평소 생활 흐름 안에서 안정적으로 이어지고 있습니다.`,
      tone: "calm",
      recommendedAction: "리포트 확인"
    };
  }

  if (adlState.icon === "rest") {
    return {
      title: "휴식 루틴 확인",
      message: `${adlState.label} 상태로 추정됩니다. 개별 기기 정보 없이도 특별한 이상 신호는 보이지 않습니다.`,
      tone: "calm",
      recommendedAction: "상태 유지"
    };
  }

  return {
    title: "생활 패턴 업데이트",
    message: `익명 요약 신호를 바탕으로 현재 상태를 ${adlState.label}로 분석했습니다.`,
    tone: anomaly.severity === "watch" ? "alert" : "calm",
    recommendedAction: anomaly.severity === "watch" ? "저녁 상태 확인" : "대시보드 확인"
  };
}

function clampConfidence(value: number) {
  return Math.max(0, Math.min(96, value));
}

function minutesBetween(baseline: string, current: string) {
  const [baselineHour, baselineMinute] = baseline.split(":").map(Number);
  const [currentHour, currentMinute] = current.split(":").map(Number);

  return currentHour * 60 + currentMinute - (baselineHour * 60 + baselineMinute);
}

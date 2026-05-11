import {
  applianceCatalog,
  applianceFingerprints,
  type ADLState,
  type AnomalyResult,
  type ApplianceEvent,
  type ApplianceId,
  type GuardianRole,
  type GuardianReport,
  interactionSlots,
  personalBaselineWindows
} from "@/data/routineDataset";
import {
  getRoutinePhaseForClock,
  getRoutinePhaseForMinutes,
  parseClockToMinutes
} from "@/lib/simulationClock";
import { localizeAdlLabel, type Language } from "@/lib/i18n";

const applianceLabels = new Map(
  applianceCatalog.map((appliance) => [appliance.id, appliance.label])
);

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

export function inferAdlState(
  events: ApplianceEvent[],
  currentMinutes: number
): ADLState {
  if (events.length === 0) {
    const phase = getRoutinePhaseForMinutes(currentMinutes);
    const lateMorning = currentMinutes >= parseClockToMinutes("08:40");

    return {
      label:
        phase === "morning" && lateMorning
          ? "아침 생활 신호 미확인"
          : "생활 리듬 대기",
      confidence: lateMorning ? 52 : 0,
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
  currentMinutes: number
): AnomalyResult {
  const morningBaseline = personalBaselineWindows[0]!;
  const morningEvents = events.filter((event) => event.phase === "morning");
  const firstMorning = morningEvents[0];

  if (!firstMorning) {
    if (currentMinutes >= parseClockToMinutes(morningBaseline.cautionAfter)) {
      return {
        severity: "caution",
        statusLabel: "확인 필요",
        baselineText: `개인 기준선 ${morningBaseline.window}`,
        currentText: "아침 생활 리듬이 아직 확인되지 않았습니다",
        reasonSummary:
          "평소 아침 활동이 시작되는 시간대가 지났지만 관련 생활 신호가 아직 요약되지 않았습니다.",
        recentSignal: "예상 시간대 이후에도 아침 생활 리듬 미확인",
        lateConfirmed: false,
        deltaMinutes:
          currentMinutes - parseClockToMinutes(morningBaseline.cautionAfter),
        gaugeValue: 84
      };
    }

    if (currentMinutes >= parseClockToMinutes(morningBaseline.observeAfter)) {
      return {
        severity: "watch",
        statusLabel: "관찰",
        baselineText: `개인 기준선 ${morningBaseline.window}`,
        currentText: "아침 생활 리듬이 평소보다 늦어질 수 있습니다",
        reasonSummary:
          "아침 활동 기준선의 여유 구간을 지나고 있어 조용히 관찰하는 상태입니다.",
        recentSignal: "아침 생활 리듬 관찰 중",
        lateConfirmed: false,
        deltaMinutes:
          currentMinutes - parseClockToMinutes(morningBaseline.observeAfter),
        gaugeValue: 54
      };
    }

    return {
      severity: "normal",
      statusLabel: "안정",
      baselineText: `개인 기준선 ${morningBaseline.window}`,
      currentText: "아침 생활 리듬이 기준선 범위 안에 있습니다",
      reasonSummary:
        "아직 평소 아침 활동이 시작되는 시간대 안에 있어 별도 확인이 필요하지 않습니다.",
      recentSignal: "조용한 대기 상태",
      lateConfirmed: false,
      deltaMinutes: 0,
      gaugeValue: 16
    };
  }

  const firstMorningMinutes = parseClockToMinutes(firstMorning.time);
  const deltaFromExpected = firstMorningMinutes - parseClockToMinutes("08:20");

  if (deltaFromExpected > 40) {
    return {
      severity: "watch",
      statusLabel: "관찰",
      baselineText: `개인 기준선 ${morningBaseline.window}`,
      currentText: "늦게 확인됨",
      reasonSummary:
        "아침 생활 리듬이 늦게 확인되어 직접 확인 필요 상태에서는 내려왔지만, 오늘 변화는 계속 관찰합니다.",
      recentSignal: "아침 생활 리듬 늦게 확인됨",
      lateConfirmed: true,
      deltaMinutes: deltaFromExpected,
      gaugeValue: Math.min(68, 46 + Math.round(deltaFromExpected / 5))
    };
  }

  const latest = events[events.length - 1];
  if (latest.phase === "night") {
    return {
      severity: "watch",
      statusLabel: "관찰",
      baselineText: "개인 기준선 21:30-22:30",
      currentText: "취침 전 생활 리듬 변화가 요약됨",
      reasonSummary:
        "취침 전 시간대의 생활 흐름이 평소보다 조금 길어져 관찰 상태로 표시합니다.",
      recentSignal: "취침 전 생활 리듬 변화",
      lateConfirmed: false,
      deltaMinutes: 18,
      gaugeValue: 42
    };
  }

  return {
    severity: "normal",
    statusLabel: "안정",
    baselineText: "개인 기준선 범위와 일치",
    currentText: "생활 흐름이 안정적으로 요약됨",
    reasonSummary:
      "오늘 생활 리듬은 개인 기준선과 큰 차이 없이 이어지고 있습니다.",
    recentSignal: privacySafeSignalLabel(latest),
    lateConfirmed: false,
    deltaMinutes: 0,
    gaugeValue: 20 + Math.min(events.length * 4, 18)
  };
}

export function generateGuardianReport(
  adlState: ADLState,
  anomaly: AnomalyResult,
  latestEvent?: ApplianceEvent,
  role: GuardianRole = "family",
  language: Language = "ko"
): GuardianReport {
  if (language === "en") {
    return generateEnglishGuardianReport(adlState, anomaly, latestEvent, role);
  }

  if (anomaly.severity === "caution") {
    if (role === "socialWorker") {
      return {
        title: "오전 루틴 확인 필요",
        message:
          "개인 기준선 대비 오전 생활 리듬 지연이 확인되었습니다. 전화 확인 또는 방문 우선순위 검토가 권장됩니다.",
        tone: "alert",
        recommendedAction: "전화 확인",
        notificationLabel: "케이스 확인 권장"
      };
    }

    return {
      title: "아침 리듬 확인 필요",
      message:
        "오늘 아침 생활 리듬이 평소보다 늦게 시작된 것으로 보여요. 가볍게 안부를 확인해보세요.",
      tone: "alert",
      recommendedAction: "전화하기",
      notificationLabel: "안부 확인 권장"
    };
  }

  if (anomaly.lateConfirmed) {
    if (role === "socialWorker") {
      return {
        title: "늦게 확인된 오전 리듬",
        message:
          "오전 생활 리듬이 지연 후 확인되었습니다. 현재는 관찰 상태이며 케이스 메모로 오늘 변화를 남길 수 있습니다.",
        tone: "warm",
        recommendedAction: "케이스 메모",
        notificationLabel: "관찰 기록"
      };
    }

    return {
      title: "늦게 확인된 아침 리듬",
      message:
        "아침 생활 리듬이 조금 늦게 확인되었어요. 지금은 관찰 상태로 내려왔지만 오늘 변화는 기록해둘게요.",
      tone: "warm",
      recommendedAction: "가족 메모",
      notificationLabel: "관찰 기록"
    };
  }

  if (!latestEvent) {
    return {
      title: role === "socialWorker" ? "케이스 상태 대기" : "GentleSight 대기",
      message:
        "생활 리듬 변화가 요약되면 원천 데이터 없이 보호자용 리포트가 생성됩니다.",
      tone: "calm",
      recommendedAction: role === "socialWorker" ? "케이스 보기" : "상태 보기",
      notificationLabel: "안정"
    };
  }

  if (adlState.icon === "meal") {
    return {
      title: role === "socialWorker" ? "식사 관련 리듬 확인" : "식사 준비 확인",
      message:
        role === "socialWorker"
          ? "식사 관련 생활 리듬이 개인 기준선 안에서 확인되었습니다. 별도 조치 없이 상태를 유지합니다."
          : "식사 관련 생활 리듬이 확인되었습니다. 평소 생활 흐름 안에서 안정적으로 이어지고 있어요.",
      tone: "calm",
      recommendedAction: role === "socialWorker" ? "케이스 메모" : "가족 메모",
      notificationLabel: "안정"
    };
  }

  if (adlState.icon === "rest") {
    return {
      title: role === "socialWorker" ? "휴식 리듬 확인" : "휴식 루틴 확인",
      message:
        role === "socialWorker"
          ? "휴식 관련 생활 리듬이 요약되었습니다. 현재 기준선 대비 중요한 변화는 없습니다."
          : "휴식 관련 생활 리듬으로 요약됩니다. 개별 기기 정보 없이도 특별한 이상 신호는 보이지 않아요.",
      tone: "calm",
      recommendedAction: role === "socialWorker" ? "방문 우선순위" : "상태 보기",
      notificationLabel: "안정"
    };
  }

  return {
    title: role === "socialWorker" ? "생활 리듬 업데이트" : "생활 패턴 업데이트",
    message:
      role === "socialWorker"
        ? `익명 요약 신호를 바탕으로 현재 상태를 ${adlState.label}로 분류했습니다.`
        : `익명 요약 신호를 바탕으로 현재 상태를 ${adlState.label}로 살펴보고 있어요.`,
    tone: anomaly.severity === "watch" ? "alert" : "calm",
    recommendedAction:
      anomaly.severity === "watch"
        ? role === "socialWorker"
          ? "케이스 메모"
          : "가족 메모"
        : "상태 보기",
    notificationLabel: anomaly.severity === "watch" ? "관찰" : "안정"
  };
}

function generateEnglishGuardianReport(
  adlState: ADLState,
  anomaly: AnomalyResult,
  latestEvent: ApplianceEvent | undefined,
  role: GuardianRole
): GuardianReport {
  if (anomaly.severity === "caution") {
    if (role === "socialWorker") {
      return {
        title: "Morning routine needs review",
        message:
          "The morning living rhythm is delayed against the personal baseline. A phone check or visit-priority review is recommended.",
        tone: "alert",
        recommendedAction: "Phone check",
        notificationLabel: "Case check recommended"
      };
    }

    return {
      title: "Morning rhythm needs check",
      message:
        "Today's morning rhythm appears to have started later than usual. A light check-in may be helpful.",
      tone: "alert",
      recommendedAction: "Call",
      notificationLabel: "Check-in recommended"
    };
  }

  if (anomaly.lateConfirmed) {
    if (role === "socialWorker") {
      return {
        title: "Morning rhythm confirmed late",
        message:
          "The morning rhythm was confirmed after a delay. It is now in watch state, and today's change can be added to the case note.",
        tone: "warm",
        recommendedAction: "Case note",
        notificationLabel: "Watch record"
      };
    }

    return {
      title: "Morning rhythm confirmed late",
      message:
        "The morning rhythm was confirmed a little late. It is now in watch state, and GentleSight will keep today's change in the record.",
      tone: "warm",
      recommendedAction: "Family note",
      notificationLabel: "Watch record"
    };
  }

  if (!latestEvent) {
    return {
      title: role === "socialWorker" ? "Case status pending" : "GentleSight ready",
      message:
        "When a living-rhythm change is summarized, a guardian report will be generated without raw data.",
      tone: "calm",
      recommendedAction: role === "socialWorker" ? "View case" : "View status",
      notificationLabel: "Stable"
    };
  }

  if (adlState.icon === "meal") {
    return {
      title:
        role === "socialWorker"
          ? "Meal-related rhythm confirmed"
          : "Meal preparation confirmed",
      message:
        role === "socialWorker"
          ? "Meal-related living rhythm was confirmed within the personal baseline. No additional action is needed."
          : "A meal-related living rhythm was confirmed. It is continuing within the usual daily flow.",
      tone: "calm",
      recommendedAction: role === "socialWorker" ? "Case note" : "Family note",
      notificationLabel: "Stable"
    };
  }

  if (adlState.icon === "rest") {
    return {
      title: role === "socialWorker" ? "Rest rhythm confirmed" : "Rest routine confirmed",
      message:
        role === "socialWorker"
          ? "A rest-related living rhythm was summarized. There is no important change against the current baseline."
          : "This is summarized as a rest-related living rhythm. No unusual signal is visible without showing device-level details.",
      tone: "calm",
      recommendedAction:
        role === "socialWorker" ? "Visit priority" : "View status",
      notificationLabel: "Stable"
    };
  }

  return {
    title:
      role === "socialWorker" ? "Living-rhythm update" : "Routine pattern update",
    message:
      role === "socialWorker"
        ? `Anonymous summary signals classify the current state as ${localizeAdlLabel(adlState, "en")}.`
        : `GentleSight is reviewing the current state as ${localizeAdlLabel(adlState, "en")} using anonymous summary signals.`,
    tone: anomaly.severity === "watch" ? "alert" : "calm",
    recommendedAction:
      anomaly.severity === "watch"
        ? role === "socialWorker"
          ? "Case note"
          : "Family note"
        : "View status",
    notificationLabel: anomaly.severity === "watch" ? "Watch" : "Stable"
  };
}

function clampConfidence(value: number) {
  return Math.max(0, Math.min(96, value));
}

export function privacySafeSignalLabel(event?: ApplianceEvent) {
  if (!event) {
    return "요약된 생활 신호 없음";
  }

  if (event.phase === "morning" && event.adlSignal === "meal") {
    return "아침 식사 준비 관련 생활 신호";
  }

  if (event.adlSignal === "rest") {
    return "휴식 관련 생활 신호";
  }

  if (event.adlSignal === "household") {
    return "가사 활동 관련 생활 신호";
  }

  if (event.adlSignal === "wake") {
    return "활동 시작 관련 생활 신호";
  }

  return "생활 리듬 관련 요약 신호";
}

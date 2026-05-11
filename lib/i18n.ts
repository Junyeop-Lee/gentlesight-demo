import type {
  ADLState,
  AnomalyResult,
  ApplianceEvent,
  ApplianceId,
  BaselineWindow,
  GuardianRole
} from "@/data/routineDataset";

export type Language = "ko" | "en";

type LocalizedText = Record<Language, string>;

const applianceLabels: Record<Language, Record<ApplianceId, string>> = {
  ko: {
    light: "조명",
    fan: "선풍기",
    microwave: "전자레인지",
    tv: "TV",
    fridge: "냉장고",
    riceCooker: "밥솥"
  },
  en: {
    light: "Light",
    fan: "Fan",
    microwave: "Microwave",
    tv: "TV",
    fridge: "Fridge",
    riceCooker: "Rice cooker"
  }
};

const adlLabels: Record<string, string> = {
  "아침 생활 신호 미확인": "Morning routine not confirmed",
  "생활 리듬 대기": "Waiting for routine signals",
  "아침 식사 준비 중": "Breakfast preparation",
  "휴식 중": "Resting",
  "저녁 루틴": "Evening routine",
  "가사 활동": "Household activity",
  "생활 신호 감지": "Routine signal detected"
};

const anomalyTexts: Record<string, string> = {
  "아침 생활 리듬이 아직 확인되지 않았습니다":
    "Morning living rhythm has not been confirmed yet",
  "평소 아침 활동이 시작되는 시간대가 지났지만 관련 생활 신호가 아직 요약되지 않았습니다.":
    "The usual morning activity window has passed, but related routine signals have not been summarized yet.",
  "예상 시간대 이후에도 아침 생활 리듬 미확인":
    "Morning routine still unconfirmed after the expected window",
  "아침 생활 리듬이 평소보다 늦어질 수 있습니다":
    "Morning living rhythm may be later than usual",
  "아침 활동 기준선의 여유 구간을 지나고 있어 조용히 관찰하는 상태입니다.":
    "The morning baseline buffer has passed, so GentleSight is quietly observing.",
  "아침 생활 리듬 관찰 중": "Observing morning living rhythm",
  "아침 생활 리듬이 기준선 범위 안에 있습니다":
    "Morning living rhythm is still within the baseline window",
  "아직 평소 아침 활동이 시작되는 시간대 안에 있어 별도 확인이 필요하지 않습니다.":
    "It is still within the usual morning activity window, so no check-in is needed yet.",
  "조용한 대기 상태": "Quiet waiting state",
  "늦게 확인됨": "Confirmed later than usual",
  "아침 생활 리듬이 늦게 확인되어 직접 확인 필요 상태에서는 내려왔지만, 오늘 변화는 계속 관찰합니다.":
    "The morning rhythm was confirmed late, so it is no longer in the direct check-needed state, but today's change remains under observation.",
  "아침 생활 리듬 늦게 확인됨": "Morning living rhythm confirmed late",
  "취침 전 생활 리듬 변화가 요약됨":
    "Pre-sleep living rhythm change summarized",
  "취침 전 시간대의 생활 흐름이 평소보다 조금 길어져 관찰 상태로 표시합니다.":
    "The pre-sleep routine is running slightly longer than usual, so it is shown as an observation state.",
  "취침 전 생활 리듬 변화": "Pre-sleep routine change",
  "생활 흐름이 안정적으로 요약됨": "Living rhythm is summarized as stable",
  "오늘 생활 리듬은 개인 기준선과 큰 차이 없이 이어지고 있습니다.":
    "Today's living rhythm is continuing without a major difference from the personal baseline.",
  "개인 기준선 범위와 일치": "Matches the personal baseline range",
  "요약된 생활 신호 없음": "No summarized routine signal",
  "아침 식사 준비 관련 생활 신호":
    "Routine signal related to breakfast preparation",
  "휴식 관련 생활 신호": "Routine signal related to rest",
  "가사 활동 관련 생활 신호": "Routine signal related to household activity",
  "활동 시작 관련 생활 신호": "Routine signal related to activity start",
  "생활 리듬 관련 요약 신호": "Summarized living-rhythm signal"
};

const baselineLabels: Record<string, string> = {
  "아침 활동 시작": "Morning activity start",
  "아침 식사 준비": "Breakfast preparation",
  "오전 휴식": "Late-morning rest",
  "점심 전후 활동": "Midday activity",
  "저녁 루틴": "Evening routine",
  "취침 전 안정": "Pre-sleep wind-down"
};

const baselineSummaries: Record<string, string> = {
  "최근 28일 기준 아침 생활 리듬은 보통 08:20 이전에 시작되었습니다.":
    "Over the last 28 days, the morning rhythm usually started before 08:20.",
  "식사 준비 관련 생활 신호는 보통 08:40 이전에 확인되었습니다.":
    "Meal-preparation routine signals were usually confirmed before 08:40.",
  "오전 중에는 가벼운 휴식 또는 실내 활동 흐름이 반복되었습니다.":
    "Late morning usually included light rest or indoor activity patterns.",
  "점심 전후에는 짧은 생활 신호가 확인되는 날이 많았습니다.":
    "Around midday, short routine signals were often confirmed.",
  "저녁 시간대에는 식사와 휴식이 이어지는 패턴이 기준선입니다.":
    "The evening baseline combines meal-related and rest-related patterns.",
  "취침 전에는 생활 리듬이 조용해지는 흐름이 기준선입니다.":
    "Before sleep, the baseline rhythm usually becomes quieter."
};

export const copy = {
  ko: {
    languageToggleLabel: "언어 전환",
    korean: "한국어",
    english: "EN",
    landscapeTitle: "가로 화면으로 전환해주세요",
    landscapeDescription:
      "이 화면은 가로 모드 및 데스크탑 환경에 최적화된 프로토타입입니다.",
    interactiveHome: "Interactive Home",
    simulationControls: "시뮬레이션 제어",
    clockControl: "시간 흐름 제어",
    currentTime: "현재 시간",
    autoFlow: "자동 흐름",
    paused: "일시정지",
    pauseTime: "시간 일시정지",
    playTime: "시간 재생",
    fastPreview: "빠르게 보기",
    resetSimulation: "시뮬레이션 초기화",
    livingSignalSimulation: "생활 신호 시뮬레이션",
    closeDetailPanel: "세부 패널 닫기",
    guardianPhone: "보호자 핸드폰 보기",
    actionBarLabel: "GentleSight 주요 정보",
    statusView: "상태 보기",
    comparison: "평소와 비교",
    privacySummary: "프라이버시 요약",
    liveReport: "Live Report",
    roleChange: "역할 변경",
    viewMode: "View Mode",
    rolePrompt: "어떤 관점으로 확인하시나요?",
    roleDescription:
      "같은 생활 리듬 요약을 가족 보호자에게는 따뜻한 안부 언어로, 사회복지사에게는 케이스 확인 언어로 보여줍니다.",
    familyRole: "가족 보호자",
    familyRoleHint: "전화하기, 가족 메모 중심",
    socialWorkerRole: "사회복지사",
    socialWorkerRoleHint: "케이스 메모, 방문 우선순위 중심",
    status: "상태",
    priority: "우선도",
    changeScore: "변화도",
    whyCheckNeeded: "왜 확인이 필요한가요?",
    closeReason: "확인 필요 사유 닫기",
    close: "닫기",
    caseSummary: "케이스 요약",
    privacyState: "개인정보 보호 상태",
    anonymizedDone: "익명 요약 처리 완료",
    anonymizedWaiting: "익명 요약 대기",
    noRawDeviceInfo: "개별 기기명과 원천 신호는 표시하지 않습니다.",
    phoneReasonFamilyTitle: "평소와 달라진 아침 리듬 때문입니다.",
    phoneReasonWorkerTitle: "개인 기준선 대비 확인이 필요합니다.",
    phoneReasonFamilyCopy:
      "개별 기기 사용 여부가 아니라 생활 리듬 변화만 보고 가볍게 안부를 확인하도록 권합니다.",
    phoneReasonWorkerCopy:
      "기기명이나 원천 신호를 노출하지 않고, 생활 리듬 변화만 케이스 확인 근거로 사용합니다.",
    livingRhythm: "Living Rhythm",
    personalBaseline: "Personal Baseline",
    currentState: "현재 상태",
    recentSummarySignal: "최근 요약 신호",
    rhythmInterpretationSuffix: "기준으로 생활 리듬을 해석합니다.",
    baselineReference: "개인 기준선 기준",
    currentStatusPrefix: "현재 상태:",
    baselineListLabel: "최근 28일 생활 리듬 기준선",
    privacyLayer: "Privacy Layer",
    privacyPromiseTitle:
      "GentleSight는 생활을 감시하지 않고 변화만 요약합니다.",
    privacyPromiseCopy:
      "보호자 화면과 향후 AI 입력에는 기기별 기록이 아니라 생활 리듬 상태, 기준선 변화, 권장 조치만 전달됩니다.",
    noCamera: "카메라 없이",
    rawHidden: "원천 데이터 숨김",
    rhythmSummary: "생활 리듬 요약",
    viewEducationalRaw: "교육용 원천 처리 보기",
    viewAfterDemo: "데모 입력 후 처리 로그 보기",
    rawConfirmTitle: "프로토타입 설명용 처리 로그입니다.",
    rawConfirmCopy:
      "실제 보호자 리포트에는 기기별 사용 기록이 직접 표시되지 않습니다. 지금 화면은 사용자가 만든 데모 입력이 어떻게 비식별 요약으로 바뀌는지 설명하기 위한 것입니다.",
    understood: "이해했습니다",
    rawProcessLabel: "원천 데이터 처리 단계",
    rawSignal: "원천 신호",
    anonymize: "비식별 처리",
    reportApplied: "리포트 반영",
    detectedInputSuffix: "입력 감지",
    reportAppliedCopy: "생활 리듬 요약에 반영",
    detectedTime: "감지 시각",
    powerChange: "전력 변화",
    rawWaveformLabel: "전력 핑거프린트 원천 파형",
    privacyFootnote:
      "위 값은 프로토타입 교육용으로만 열람됩니다. 실제 보호자 리포트와 AI API에는 상태, 변화 정도, 권장 조치 요약만 전달됩니다."
  },
  en: {
    languageToggleLabel: "Language toggle",
    korean: "KR",
    english: "English",
    landscapeTitle: "Rotate to landscape",
    landscapeDescription:
      "This prototype is optimized for landscape and desktop viewing.",
    interactiveHome: "Interactive Home",
    simulationControls: "Simulation controls",
    clockControl: "Time controls",
    currentTime: "Current time",
    autoFlow: "Auto flow",
    paused: "Paused",
    pauseTime: "Pause time",
    playTime: "Resume time",
    fastPreview: "Fast preview",
    resetSimulation: "Reset simulation",
    livingSignalSimulation: "Routine signal simulation",
    closeDetailPanel: "Close detail panel",
    guardianPhone: "Open guardian phone",
    actionBarLabel: "GentleSight key information",
    statusView: "Status",
    comparison: "Baseline",
    privacySummary: "Privacy",
    liveReport: "Live Report",
    roleChange: "Change role",
    viewMode: "View Mode",
    rolePrompt: "Which perspective are you using?",
    roleDescription:
      "The same routine summary is shown as warm family check-in language or as case-oriented social-care language.",
    familyRole: "Family guardian",
    familyRoleHint: "Calls and family notes",
    socialWorkerRole: "Social worker",
    socialWorkerRoleHint: "Case notes and visit priority",
    status: "Status",
    priority: "Priority",
    changeScore: "Change",
    whyCheckNeeded: "Why check?",
    closeReason: "Close check-needed reason",
    close: "Close",
    caseSummary: "Case summary",
    privacyState: "Privacy state",
    anonymizedDone: "Anonymous summary ready",
    anonymizedWaiting: "Waiting for anonymous summary",
    noRawDeviceInfo: "Device names and raw signals are not shown.",
    phoneReasonFamilyTitle: "The morning rhythm changed from usual.",
    phoneReasonWorkerTitle: "A check is needed against the personal baseline.",
    phoneReasonFamilyCopy:
      "GentleSight recommends a light check-in based only on rhythm change, not individual device use.",
    phoneReasonWorkerCopy:
      "The case rationale uses only living-rhythm change without exposing device names or raw signals.",
    livingRhythm: "Living Rhythm",
    personalBaseline: "Personal Baseline",
    currentState: "Current state",
    recentSummarySignal: "Recent summary signal",
    rhythmInterpretationSuffix: "is used to interpret the living rhythm.",
    baselineReference: "Personal baseline reference",
    currentStatusPrefix: "Current status:",
    baselineListLabel: "28-day living-rhythm baseline",
    privacyLayer: "Privacy Layer",
    privacyPromiseTitle:
      "GentleSight summarizes change without monitoring daily life.",
    privacyPromiseCopy:
      "Guardian screens and future AI inputs receive only living-rhythm state, baseline change, and recommended action, not device-level logs.",
    noCamera: "No camera",
    rawHidden: "Raw data hidden",
    rhythmSummary: "Routine summary",
    viewEducationalRaw: "View educational processing",
    viewAfterDemo: "Enter demo input first",
    rawConfirmTitle: "This processing log is for prototype explanation.",
    rawConfirmCopy:
      "Actual guardian reports do not directly show device-level usage logs. This view explains how demo inputs become de-identified summaries.",
    understood: "I understand",
    rawProcessLabel: "Raw data processing steps",
    rawSignal: "Raw signal",
    anonymize: "De-identification",
    reportApplied: "Report use",
    detectedInputSuffix: "input detected",
    reportAppliedCopy: "Reflected in living-rhythm summary",
    detectedTime: "Detected time",
    powerChange: "Power change",
    rawWaveformLabel: "Raw power-fingerprint waveform",
    privacyFootnote:
      "These values are shown only for prototype education. Actual guardian reports and AI APIs receive only state, degree of change, and recommended action summaries."
  }
} satisfies Record<Language, Record<string, string>>;

export const statusLabels: Record<Language, Record<AnomalyResult["severity"], string>> = {
  ko: {
    normal: "안정",
    watch: "관찰",
    caution: "확인 필요"
  },
  en: {
    normal: "Stable",
    watch: "Watch",
    caution: "Needs check"
  }
};

export const toneLabels: Record<Language, Record<"calm" | "warm" | "alert", string>> = {
  ko: {
    calm: "안정",
    warm: "관찰",
    alert: "확인 필요"
  },
  en: {
    calm: "Stable",
    warm: "Watch",
    alert: "Needs check"
  }
};

export function getApplianceLabel(applianceId: ApplianceId, language: Language) {
  return applianceLabels[language][applianceId];
}

export function getApplianceInputLabel(
  applianceId: ApplianceId,
  language: Language
) {
  const label = getApplianceLabel(applianceId, language);

  return language === "ko"
    ? `${label} 상호작용 입력`
    : `${label} interaction input`;
}

export function localizeAdlLabel(adlState: ADLState, language: Language) {
  if (language === "ko") {
    return adlState.label;
  }

  return adlLabels[adlState.label] ?? "Routine signal detected";
}

export function localizeAnomalyText(text: string, language: Language) {
  if (language === "ko") {
    return text;
  }

  if (text.startsWith("개인 기준선 ")) {
    return text.replace("개인 기준선 ", "Personal baseline ");
  }

  return anomalyTexts[text] ?? text;
}

export function localizeRecentSignal(
  event: ApplianceEvent | undefined,
  fallback: string,
  language: Language
) {
  if (!event) {
    return localizeAnomalyText(fallback, language);
  }

  return getPrivacySafeSignalLabel(event, language);
}

export function getPrivacySafeSignalLabel(
  event: ApplianceEvent | undefined,
  language: Language
) {
  if (!event) {
    return localizeAnomalyText("요약된 생활 신호 없음", language);
  }

  if (event.phase === "morning" && event.adlSignal === "meal") {
    return localizeAnomalyText("아침 식사 준비 관련 생활 신호", language);
  }

  if (event.adlSignal === "rest") {
    return localizeAnomalyText("휴식 관련 생활 신호", language);
  }

  if (event.adlSignal === "household") {
    return localizeAnomalyText("가사 활동 관련 생활 신호", language);
  }

  if (event.adlSignal === "wake") {
    return localizeAnomalyText("활동 시작 관련 생활 신호", language);
  }

  return localizeAnomalyText("생활 리듬 관련 요약 신호", language);
}

export function localizeBaselineLabel(
  baseline: BaselineWindow,
  language: Language
) {
  if (language === "ko") {
    return baseline.label;
  }

  return baselineLabels[baseline.label] ?? baseline.label;
}

export function localizeBaselineSummary(
  baseline: BaselineWindow,
  language: Language
) {
  if (language === "ko") {
    return baseline.summary;
  }

  return baselineSummaries[baseline.summary] ?? baseline.summary;
}

export function getRoutineStateForAi(adlState: ADLState, language: Language) {
  return localizeAdlLabel(adlState, language);
}

export function getRoleLabel(role: GuardianRole, language: Language) {
  if (role === "socialWorker") {
    return copy[language].socialWorkerRole;
  }

  return copy[language].familyRole;
}

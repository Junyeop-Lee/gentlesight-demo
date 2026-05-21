export type ApplianceId =
  | "light"
  | "fan"
  | "microwave"
  | "tv"
  | "fridge"
  | "riceCooker";

export type RoutinePhase = "morning" | "noon" | "evening" | "night";

export type ApplianceEvent = {
  id: string;
  appliance: ApplianceId;
  applianceLabel: string;
  time: string;
  baselineTime: string;
  phase: RoutinePhase;
  powerDelta: number;
  duration: number;
  waveform: number[];
  adlSignal: "wake" | "meal" | "rest" | "household" | "idle";
};

export type ADLState = {
  label: string;
  confidence: number;
  relatedEvents: string[];
  icon: "meal" | "rest" | "evening" | "household" | "unknown";
};

export type AnomalyResult = {
  severity: "normal" | "watch" | "caution";
  statusLabel: "안정" | "관찰" | "확인 필요";
  baselineText: string;
  currentText: string;
  reasonSummary: string;
  recentSignal: string;
  lateConfirmed: boolean;
  deltaMinutes: number;
  gaugeValue: number;
};

export type GuardianReport = {
  title: string;
  message: string;
  supportingSuggestion?: string;
  changeSummary?: string;
  tone: "calm" | "warm" | "alert";
  recommendedAction: string;
  notificationLabel: string;
};

export type GuardianRole = "family" | "socialWorker";

export type ApplianceMeta = {
  id: ApplianceId;
  label: string;
  room: string;
  x: number;
  y: number;
  color: string;
};

export type InteractionSlot = {
  id: string;
  phase: RoutinePhase;
  label: string;
  time: string;
  delayedTime?: string;
};

export type BaselineWindow = {
  id: string;
  label: string;
  phase: RoutinePhase;
  expectedSignal: ApplianceEvent["adlSignal"] | "any";
  window: string;
  start: string;
  observeAfter: string;
  cautionAfter: string;
  end: string;
  summary: string;
};

export const timelineSlots = [
  { id: "morning", phase: "morning", label: "오전 8시", shortLabel: "08:00" },
  { id: "noon", phase: "noon", label: "오후 12시", shortLabel: "12:00" },
  { id: "evening", phase: "evening", label: "오후 7시", shortLabel: "19:00" },
  { id: "night", phase: "night", label: "오후 10시", shortLabel: "22:00" }
] as const;

export const interactionSlots: InteractionSlot[] = [
  {
    id: "wake-start",
    phase: "morning",
    label: "기상",
    time: "08:00",
    delayedTime: "09:18"
  },
  {
    id: "breakfast-prep",
    phase: "morning",
    label: "아침 준비",
    time: "08:12",
    delayedTime: "09:31"
  },
  {
    id: "breakfast-heat",
    phase: "morning",
    label: "식사",
    time: "08:27",
    delayedTime: "09:46"
  },
  { id: "noon-rest", phase: "noon", label: "휴식", time: "12:04" },
  { id: "noon-snack", phase: "noon", label: "간식", time: "12:22" },
  { id: "dinner-prep", phase: "evening", label: "저녁 준비", time: "19:03" },
  { id: "evening-rest", phase: "evening", label: "저녁 휴식", time: "19:28" },
  { id: "night-check", phase: "night", label: "마감", time: "21:46" }
];

export const personalBaselineWindows: BaselineWindow[] = [
  {
    id: "morning-start",
    label: "아침 활동 시작",
    phase: "morning",
    expectedSignal: "wake",
    window: "07:50-08:20",
    start: "07:50",
    observeAfter: "08:40",
    cautionAfter: "09:00",
    end: "10:30",
    summary: "최근 28일 기준 아침 생활 리듬은 보통 08:20 이전에 시작되었습니다."
  },
  {
    id: "breakfast",
    label: "아침 식사 준비",
    phase: "morning",
    expectedSignal: "meal",
    window: "08:00-08:40",
    start: "08:00",
    observeAfter: "08:50",
    cautionAfter: "09:10",
    end: "10:40",
    summary: "식사 준비 관련 생활 신호는 보통 08:40 이전에 확인되었습니다."
  },
  {
    id: "late-morning-rest",
    label: "오전 휴식",
    phase: "morning",
    expectedSignal: "rest",
    window: "09:00-11:00",
    start: "09:00",
    observeAfter: "11:10",
    cautionAfter: "11:40",
    end: "11:59",
    summary: "오전 중에는 가벼운 휴식 또는 실내 활동 흐름이 반복되었습니다."
  },
  {
    id: "noon",
    label: "점심 전후 활동",
    phase: "noon",
    expectedSignal: "any",
    window: "11:30-12:30",
    start: "11:30",
    observeAfter: "12:45",
    cautionAfter: "13:10",
    end: "14:00",
    summary: "점심 전후에는 짧은 생활 신호가 확인되는 날이 많았습니다."
  },
  {
    id: "evening",
    label: "저녁 루틴",
    phase: "evening",
    expectedSignal: "any",
    window: "18:30-20:00",
    start: "18:30",
    observeAfter: "20:15",
    cautionAfter: "20:45",
    end: "21:20",
    summary: "저녁 시간대에는 식사와 휴식이 이어지는 패턴이 기준선입니다."
  },
  {
    id: "night",
    label: "취침 전 안정",
    phase: "night",
    expectedSignal: "rest",
    window: "21:30-22:30",
    start: "21:30",
    observeAfter: "22:30",
    cautionAfter: "23:00",
    end: "23:30",
    summary: "취침 전에는 생활 리듬이 조용해지는 흐름이 기준선입니다."
  }
];

export const applianceCatalog: ApplianceMeta[] = [
  {
    id: "light",
    label: "조명",
    room: "거실",
    x: 72,
    y: 20,
    color: "#f0b74a"
  },
  {
    id: "fan",
    label: "선풍기",
    room: "방",
    x: 65,
    y: 52,
    color: "#36a68c"
  },
  {
    id: "microwave",
    label: "전자레인지",
    room: "주방",
    x: 52,
    y: 35,
    color: "#df6f57"
  },
  {
    id: "tv",
    label: "TV",
    room: "거실",
    x: 85,
    y: 60,
    color: "#3d76d1"
  },
  {
    id: "fridge",
    label: "냉장고",
    room: "주방",
    x: 52,
    y: 48,
    color: "#6a7c8f"
  },
  {
    id: "riceCooker",
    label: "밥솥",
    room: "주방",
    x: 12,
    y: 51,
    color: "#8c6edb"
  }
];

export const applianceFingerprints: Record<
  ApplianceId,
  Omit<
    ApplianceEvent,
    "id" | "appliance" | "applianceLabel" | "time" | "baselineTime" | "phase"
  >
> = {
  light: {
    powerDelta: 70,
    duration: 45,
    waveform: [8, 17, 13, 15, 14, 16, 15, 14, 16, 13, 15, 12],
    adlSignal: "wake"
  },
  fan: {
    powerDelta: 45,
    duration: 120,
    waveform: [4, 18, 12, 14, 13, 15, 14, 13, 12, 9, 6, 5],
    adlSignal: "rest"
  },
  microwave: {
    powerDelta: 950,
    duration: 8,
    waveform: [6, 44, 80, 42, 83, 45, 78, 40, 75, 33, 14, 7],
    adlSignal: "meal"
  },
  tv: {
    powerDelta: 130,
    duration: 90,
    waveform: [9, 22, 18, 24, 20, 26, 23, 25, 22, 24, 21, 18],
    adlSignal: "rest"
  },
  fridge: {
    powerDelta: 180,
    duration: 22,
    waveform: [7, 34, 42, 37, 35, 31, 28, 25, 21, 18, 12, 7],
    adlSignal: "meal"
  },
  riceCooker: {
    powerDelta: 480,
    duration: 35,
    waveform: [5, 22, 64, 78, 74, 70, 68, 54, 38, 24, 14, 8],
    adlSignal: "meal"
  }
};

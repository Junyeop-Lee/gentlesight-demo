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
  baselineText: string;
  currentText: string;
  deltaMinutes: number;
  gaugeValue: number;
};

export type GuardianReport = {
  title: string;
  message: string;
  tone: "calm" | "warm" | "alert";
  recommendedAction: string;
};

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

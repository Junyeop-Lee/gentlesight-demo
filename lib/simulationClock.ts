import type { RoutinePhase } from "@/data/routineDataset";
import type { Language } from "@/lib/i18n";

export const SIMULATION_START_MINUTES = 5 * 60;
export const SIMULATION_END_MINUTES = 29 * 60;
export const DEFAULT_SIMULATION_MINUTES_PER_SECOND = 10;
export const FAST_SIMULATION_MINUTES_PER_SECOND = 30;

export function clampSimulationMinutes(minutes: number) {
  return Math.max(
    SIMULATION_START_MINUTES,
    Math.min(SIMULATION_END_MINUTES, minutes)
  );
}

export function formatClock(minutes: number) {
  const clampedMinutes = clampSimulationMinutes(minutes);
  const minutesInDay = clampedMinutes % (24 * 60);
  const hour = Math.floor(minutesInDay / 60);
  const minute = minutesInDay % 60;

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}

export function formatKoreanClock(minutes: number) {
  const clampedMinutes = clampSimulationMinutes(minutes);
  const minutesInDay = clampedMinutes % (24 * 60);
  const hour = Math.floor(minutesInDay / 60);
  const minute = minutesInDay % 60;
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const dayPrefix = clampedMinutes >= 24 * 60 ? "다음날 " : "";

  return `${dayPrefix}${period} ${displayHour}:${minute
    .toString()
    .padStart(2, "0")}`;
}

export function formatLocalizedClock(minutes: number, language: Language) {
  if (language === "ko") {
    return formatKoreanClock(minutes);
  }

  const clampedMinutes = clampSimulationMinutes(minutes);
  const minutesInDay = clampedMinutes % (24 * 60);
  const hour = Math.floor(minutesInDay / 60);
  const minute = minutesInDay % 60;
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const dayPrefix = clampedMinutes >= 24 * 60 ? "Next day " : "";

  return `${dayPrefix}${displayHour}:${minute
    .toString()
    .padStart(2, "0")} ${period}`;
}

export function parseClockToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
}

export function getRoutinePhaseForMinutes(minutes: number): RoutinePhase {
  const minutesInDay = minutes % (24 * 60);

  if (minutesInDay < 5 * 60) {
    return "night";
  }

  if (minutesInDay < 12 * 60) {
    return "morning";
  }

  if (minutesInDay < 19 * 60) {
    return "noon";
  }

  if (minutesInDay < 22 * 60) {
    return "evening";
  }

  return "night";
}

export function getRoutinePhaseForClock(time: string) {
  return getRoutinePhaseForMinutes(parseClockToMinutes(time));
}

export function getTimelineProgress(minutes: number) {
  const clampedMinutes = clampSimulationMinutes(minutes);
  const totalMinutes = SIMULATION_END_MINUTES - SIMULATION_START_MINUTES;

  return (clampedMinutes - SIMULATION_START_MINUTES) / totalMinutes;
}

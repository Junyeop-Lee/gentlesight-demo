import type { RoutinePhase } from "@/data/routineDataset";

export const SIMULATION_START_MINUTES = 7 * 60 + 30;
export const SIMULATION_END_MINUTES = 22 * 60;
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
  const hour = Math.floor(clampedMinutes / 60);
  const minute = clampedMinutes % 60;

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}

export function formatKoreanClock(minutes: number) {
  const clampedMinutes = clampSimulationMinutes(minutes);
  const hour = Math.floor(clampedMinutes / 60);
  const minute = clampedMinutes % 60;
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${period} ${displayHour}:${minute.toString().padStart(2, "0")}`;
}

export function parseClockToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
}

export function getRoutinePhaseForMinutes(minutes: number): RoutinePhase {
  if (minutes < 12 * 60) {
    return "morning";
  }

  if (minutes < 19 * 60) {
    return "noon";
  }

  if (minutes < 22 * 60) {
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

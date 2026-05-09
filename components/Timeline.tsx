import { motion } from "framer-motion";
import { timelineSlots } from "@/data/routineDataset";
import {
  getRoutinePhaseForMinutes,
  parseClockToMinutes
} from "@/lib/simulationClock";

type TimelineProps = {
  currentMinutes: number;
  progress: number;
};

export function Timeline({ currentMinutes, progress }: TimelineProps) {
  const currentPhase = getRoutinePhaseForMinutes(currentMinutes);

  return (
    <section className="timelinePanel" aria-label="하루 타임라인">
      <div className="timelineTrack">
        <motion.div
          className="timelineProgress"
          initial={false}
          animate={{ width: `${Math.max(progress * 100, 4)}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
        {timelineSlots.map((slot) => {
          const isComplete = currentMinutes >= parseClockToMinutes(slot.shortLabel);
          const isCurrent = currentPhase === slot.phase;

          return (
            <div className="timeSlot" key={slot.id}>
              <motion.span
                className={[
                  "timeDot",
                  isComplete ? "complete" : "",
                  isCurrent ? "current" : ""
                ].join(" ")}
                animate={isCurrent ? { scale: [1, 1.16, 1] } : { scale: 1 }}
                transition={{ repeat: isCurrent ? Infinity : 0, duration: 1.8 }}
              />
              <strong>{slot.label}</strong>
              <small>{slot.shortLabel}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

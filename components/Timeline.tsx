import { motion } from "framer-motion";
import { timelineSlots, type ApplianceEvent } from "@/data/routineDataset";

type TimelineProps = {
  events: ApplianceEvent[];
  progress: number;
};

export function Timeline({ events, progress }: TimelineProps) {
  const completedPhases = new Set(events.map((event) => event.phase));
  const currentPhase = events.at(-1)?.phase ?? "morning";

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
          const isComplete = completedPhases.has(slot.phase);
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

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ChartNoAxesCombined,
  MessageSquareText
} from "lucide-react";
import {
  type ADLState,
  type AnomalyResult
} from "@/data/routineDataset";

type PipelineVisualizerProps = {
  adlState: ADLState;
  anomaly: AnomalyResult;
  hasSignal: boolean;
};

const steps = [
  {
    id: "inference",
    label: "Inference",
    Icon: BrainCircuit
  },
  {
    id: "anomaly",
    label: "Anomaly Detection",
    Icon: ChartNoAxesCombined
  },
  {
    id: "generation",
    label: "LLM Generation",
    Icon: MessageSquareText
  }
];

export function PipelineVisualizer({
  adlState,
  anomaly,
  hasSignal
}: PipelineVisualizerProps) {
  return (
    <section className="pipelinePanel" aria-labelledby="pipeline-title">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">AI Pipeline</p>
          <h2 id="pipeline-title">요약 신호가 리포트로 바뀌는 과정</h2>
        </div>
        <span className={`severityBadge ${anomaly.severity}`}>
          {severityLabel[anomaly.severity]}
        </span>
      </div>

      <div className="pipelineFlow">
        {steps.map(({ id, label, Icon }, index) => (
          <motion.div
            className={["pipelineStep", hasSignal ? "active" : ""].join(" ")}
            key={id}
            initial={false}
            animate={hasSignal ? { opacity: 1, y: 0 } : { opacity: 0.55, y: 0 }}
            transition={{ delay: index * 0.12, duration: 0.35 }}
          >
            <span className="pipelineIcon">
              <Icon aria-hidden="true" size={20} />
            </span>
            <span>{label}</span>
          </motion.div>
        ))}
      </div>

      <div className="pipelineReadout">
        <div className="adlReadout">
          <span>상태</span>
          <strong>{adlState.label}</strong>
          <small>{adlState.confidence}% 신뢰도</small>
        </div>

        <div
          className="gaugeWrap"
          aria-label={`주의도 ${anomaly.gaugeValue}`}
        >
          <div
            className={`anomalyGauge ${anomaly.severity}`}
            style={
              {
                "--gauge-value": `${anomaly.gaugeValue * 3.6}deg`
              } as CSSProperties
            }
          >
            <span>{anomaly.gaugeValue}</span>
          </div>
          <div className="baselineText">
            <strong>{anomaly.currentText}</strong>
            <span>{anomaly.baselineText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const severityLabel: Record<AnomalyResult["severity"], string> = {
  pending: "예정",
  normal: "정상",
  watch: "관찰",
  caution: "주의"
};

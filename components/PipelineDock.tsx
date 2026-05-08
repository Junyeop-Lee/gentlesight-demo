import type { CSSProperties } from "react";
import {
  BrainCircuit,
  ChartNoAxesCombined,
  MessageSquareText,
  SlidersHorizontal
} from "lucide-react";
import {
  type ADLState,
  type AnomalyResult
} from "@/data/routineDataset";

type PipelineDockProps = {
  adlState: ADLState;
  anomaly: AnomalyResult;
  hasSignal: boolean;
  onOpenDetails: () => void;
};

const dockSteps = [
  { label: "Inference", Icon: BrainCircuit },
  { label: "Anomaly", Icon: ChartNoAxesCombined },
  { label: "LLM", Icon: MessageSquareText }
];

export function PipelineDock({
  adlState,
  anomaly,
  hasSignal,
  onOpenDetails
}: PipelineDockProps) {
  return (
    <div className="pipelineDock" aria-label="AI 파이프라인 요약">
      <div className="pipelineDockSteps">
        {dockSteps.map(({ label, Icon }) => (
          <div className={hasSignal ? "dockStep active" : "dockStep"} key={label}>
            <Icon aria-hidden="true" size={17} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="pipelineDockReadout">
        <div>
          <span>상태</span>
          <strong>{adlState.label}</strong>
        </div>
        <div
          className={`miniGauge ${anomaly.severity}`}
          style={
            {
              "--gauge-value": `${anomaly.gaugeValue * 3.6}deg`
            } as CSSProperties
          }
          aria-label={`주의도 ${anomaly.gaugeValue}`}
        >
          <strong>{anomaly.gaugeValue}</strong>
        </div>
      </div>

      <button className="dockDetailButton" type="button" onClick={onOpenDetails}>
        <SlidersHorizontal aria-hidden="true" size={17} />
        <span>세부 정보</span>
      </button>
    </div>
  );
}

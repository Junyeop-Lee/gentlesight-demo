import { Activity, CalendarClock, CircleAlert, HeartPulse } from "lucide-react";
import {
  personalBaselineWindows,
  type ADLState,
  type AnomalyResult
} from "@/data/routineDataset";

type PanelProps = {
  adlState: ADLState;
  anomaly: AnomalyResult;
  hasSignal: boolean;
  currentTimeLabel: string;
};

export function StatusPanel({
  adlState,
  anomaly,
  hasSignal,
  currentTimeLabel
}: PanelProps) {
  return (
    <section className="livingPanel" aria-labelledby="status-panel-title">
      <div className="sectionHeader compact">
        <div>
          <p className="eyebrow">Living Rhythm</p>
          <h2 id="status-panel-title">상태 보기</h2>
        </div>
        <span className={`severityBadge ${anomaly.severity}`}>
          {anomaly.statusLabel}
        </span>
      </div>

      <div className="livingPanelGrid">
        <div className="livingStateCard">
          <HeartPulse aria-hidden="true" size={22} />
          <span>현재 상태</span>
          <strong>{adlState.label}</strong>
          <p>{anomaly.currentText}</p>
        </div>

        <div className="livingStateCard">
          <Activity aria-hidden="true" size={22} />
          <span>최근 요약 신호</span>
          <strong>{hasSignal ? anomaly.recentSignal : "조용한 대기 상태"}</strong>
          <p>{currentTimeLabel} 기준으로 생활 리듬을 해석합니다.</p>
        </div>
      </div>

      <div className="livingReason">
        <CircleAlert aria-hidden="true" size={18} />
        <p>{anomaly.reasonSummary}</p>
      </div>
    </section>
  );
}

export function BaselineComparisonPanel({
  anomaly,
  currentTimeLabel
}: Pick<PanelProps, "anomaly" | "currentTimeLabel">) {
  return (
    <section className="livingPanel" aria-labelledby="comparison-panel-title">
      <div className="sectionHeader compact">
        <div>
          <p className="eyebrow">Personal Baseline</p>
          <h2 id="comparison-panel-title">평소와 비교</h2>
        </div>
        <CalendarClock aria-hidden="true" size={20} />
      </div>

      <div className="baselineSummary">
        <span>개인 기준선 기준</span>
        <strong>{anomaly.baselineText}</strong>
        <p>{currentTimeLabel} 현재 상태: {anomaly.currentText}</p>
      </div>

      <div className="baselineList" aria-label="최근 28일 생활 리듬 기준선">
        {personalBaselineWindows.map((baseline) => (
          <div key={baseline.id}>
            <strong>{baseline.label}</strong>
            <span>{baseline.window}</span>
            <p>{baseline.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

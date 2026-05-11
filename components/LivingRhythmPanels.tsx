import { Activity, CalendarClock, CircleAlert, HeartPulse } from "lucide-react";
import {
  personalBaselineWindows,
  type ADLState,
  type AnomalyResult
} from "@/data/routineDataset";
import {
  copy,
  localizeAdlLabel,
  localizeAnomalyText,
  localizeBaselineLabel,
  localizeBaselineSummary,
  statusLabels,
  type Language
} from "@/lib/i18n";

type PanelProps = {
  adlState: ADLState;
  anomaly: AnomalyResult;
  hasSignal: boolean;
  currentTimeLabel: string;
  language: Language;
};

export function StatusPanel({
  adlState,
  anomaly,
  hasSignal,
  currentTimeLabel,
  language
}: PanelProps) {
  const t = copy[language];

  return (
    <section className="livingPanel" aria-labelledby="status-panel-title">
      <div className="sectionHeader compact">
        <div>
          <p className="eyebrow">{t.livingRhythm}</p>
          <h2 id="status-panel-title">{t.statusView}</h2>
        </div>
        <span className={`severityBadge ${anomaly.severity}`}>
          {statusLabels[language][anomaly.severity]}
        </span>
      </div>

      <div className="livingPanelGrid">
        <div className="livingStateCard">
          <HeartPulse aria-hidden="true" size={22} />
          <span>{t.currentState}</span>
          <strong>{localizeAdlLabel(adlState, language)}</strong>
          <p>{localizeAnomalyText(anomaly.currentText, language)}</p>
        </div>

        <div className="livingStateCard">
          <Activity aria-hidden="true" size={22} />
          <span>{t.recentSummarySignal}</span>
          <strong>
            {localizeAnomalyText(
              hasSignal ? anomaly.recentSignal : "조용한 대기 상태",
              language
            )}
          </strong>
          <p>
            {language === "ko"
              ? `${currentTimeLabel} ${t.rhythmInterpretationSuffix}`
              : `${currentTimeLabel} ${t.rhythmInterpretationSuffix}`}
          </p>
        </div>
      </div>

      <div className="livingReason">
        <CircleAlert aria-hidden="true" size={18} />
        <p>{localizeAnomalyText(anomaly.reasonSummary, language)}</p>
      </div>
    </section>
  );
}

export function BaselineComparisonPanel({
  anomaly,
  currentTimeLabel,
  language
}: Pick<PanelProps, "anomaly" | "currentTimeLabel" | "language">) {
  const t = copy[language];

  return (
    <section className="livingPanel" aria-labelledby="comparison-panel-title">
      <div className="sectionHeader compact">
        <div>
          <p className="eyebrow">{t.personalBaseline}</p>
          <h2 id="comparison-panel-title">{t.comparison}</h2>
        </div>
        <CalendarClock aria-hidden="true" size={20} />
      </div>

      <div className="baselineSummary">
        <span>{t.baselineReference}</span>
        <strong>{localizeAnomalyText(anomaly.baselineText, language)}</strong>
        <p>
          {currentTimeLabel} {t.currentStatusPrefix}{" "}
          {localizeAnomalyText(anomaly.currentText, language)}
        </p>
      </div>

      <div className="baselineList" aria-label={t.baselineListLabel}>
        {personalBaselineWindows.map((baseline) => (
          <div key={baseline.id}>
            <strong>{localizeBaselineLabel(baseline, language)}</strong>
            <span>{baseline.window}</span>
            <p>{localizeBaselineSummary(baseline, language)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

import { Activity, CalendarClock, CircleAlert, HeartPulse } from "lucide-react";
import {
  type ADLState,
  type AnomalyResult,
  type ApplianceEvent
} from "@/data/routineDataset";
import { getBaselineProgress } from "@/lib/nilmLogic";
import {
  copy,
  baselineProgressLabels,
  localizeAdlLabel,
  localizeAnomalyText,
  localizeBaselineLabel,
  localizeBaselineSummary,
  localizeBaselineWindowLabel,
  statusLabels,
  type Language
} from "@/lib/i18n";

type PanelProps = {
  adlState: ADLState;
  anomaly: AnomalyResult;
  events: ApplianceEvent[];
  hasSignal: boolean;
  currentMinutes: number;
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
  events,
  currentMinutes,
  currentTimeLabel,
  language
}: Pick<
  PanelProps,
  "anomaly" | "events" | "currentMinutes" | "currentTimeLabel" | "language"
>) {
  const t = copy[language];
  const baselineProgress = getBaselineProgress(events, currentMinutes);
  const currentProgress =
    baselineProgress.find((progress) => progress.isCurrent) ??
    baselineProgress[0];

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
        <strong>
          {currentProgress
            ? localizeBaselineWindowLabel(currentProgress.baseline, language)
            : t.personalBaseline}
        </strong>
        <p>
          {currentTimeLabel} {t.currentStatusPrefix}{" "}
          {localizeAnomalyText(anomaly.currentText, language)}
        </p>
      </div>

      <div className="baselineList" aria-label={t.baselineListLabel}>
        {baselineProgress.map((progress) => (
          <div
            key={progress.baseline.id}
            className={progress.isCurrent ? "current" : undefined}
            data-status={progress.status}
          >
            <div className="baselineListHeader">
              <strong>{localizeBaselineLabel(progress.baseline, language)}</strong>
              <span>{localizeBaselineWindowLabel(progress.baseline, language)}</span>
            </div>
            <span
              className="baselineProgressPill"
              aria-label={`${t.baselineProgressLabel}: ${
                baselineProgressLabels[language][progress.status]
              }`}
            >
              {baselineProgressLabels[language][progress.status]}
            </span>
            <p>{localizeBaselineSummary(progress.baseline, language)}</p>
            {progress.status === "confirmed" ? (
              <p className="baselineSignal">
                {localizeAnomalyText(progress.recentSignal, language)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

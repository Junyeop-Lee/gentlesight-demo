import { useEffect, useState } from "react";
import {
  BellRing,
  BriefcaseBusiness,
  HeartHandshake,
  LockKeyhole,
  Phone,
  ShieldCheck
} from "lucide-react";
import {
  type ADLState,
  type AnomalyResult,
  type GuardianRole,
  type GuardianReport
} from "@/data/routineDataset";
import {
  copy,
  localizeAdlLabel,
  localizeAnomalyText,
  statusLabels,
  toneLabels,
  type Language
} from "@/lib/i18n";

type GuardianPhoneProps = {
  report: GuardianReport;
  isReportLoading: boolean;
  adlState: ADLState;
  anomaly: AnomalyResult;
  hasSignal: boolean;
  language: Language;
  role: GuardianRole | null;
  onRoleChange: (role: GuardianRole | null) => void;
};

export function GuardianPhone({
  report,
  isReportLoading,
  adlState,
  anomaly,
  hasSignal,
  language,
  role,
  onRoleChange
}: GuardianPhoneProps) {
  const [showReason, setShowReason] = useState(false);
  const t = copy[language];
  const reportTitle = isReportLoading ? t.reportGeneratingTitle : report.title;
  const reportMessage = isReportLoading
    ? t.reportGeneratingMessage
    : report.message;
  const typedMessage = useTypedMessage(reportMessage);

  useEffect(() => {
    setShowReason(false);
  }, [anomaly.severity, role]);

  return (
    <section className="phonePanel" aria-labelledby="phone-title">
      <div className="phoneFrame">
        <div className="phoneTopBar">
          <span>GentleSight App</span>
          {role ? (
            <button
              className="roleChangeButton"
              type="button"
              onClick={() => onRoleChange(null)}
            >
              {t.roleChange}
            </button>
          ) : (
            <ShieldCheck aria-hidden="true" size={18} />
          )}
        </div>

        {!role ? (
          <RoleSelection language={language} onSelect={onRoleChange} />
        ) : (
          <div className="phoneContent">
            <div className="phoneStatus">
              <div>
                <p className="eyebrow">{t.liveReport}</p>
                <h2 id="phone-title">{reportTitle}</h2>
              </div>
              <span className={`statusPill ${report.tone}`}>
                {toneLabels[language][report.tone]}
              </span>
            </div>

            <div className="reportBubble" aria-live="polite">
              <BellRing aria-hidden="true" size={20} />
              <div className="reportBubbleCopy">
                <p>{typedMessage}</p>
                {!isReportLoading && report.changeSummary ? (
                  <small>{report.changeSummary}</small>
                ) : null}
                {!isReportLoading && report.supportingSuggestion ? (
                  <small>{report.supportingSuggestion}</small>
                ) : null}
              </div>
              <span className="typingCursor" aria-hidden="true" />
            </div>

            <div className="phoneMetrics">
              <div
                className={`phoneMetricCard statusMetric ${
                  anomaly.severity === "caution" ? "needsReason" : ""
                }`}
              >
                <span>{t.status}</span>
                <strong>{statusLabels[language][anomaly.severity]}</strong>
                {anomaly.severity === "caution" ? (
                  <button
                    className="reasonToggleButton"
                    type="button"
                    aria-expanded={showReason}
                    onClick={() => setShowReason((shown) => !shown)}
                  >
                    {t.whyCheckNeeded}
                  </button>
                ) : null}
              </div>
              <div className="phoneMetricCard scoreMetric">
                <span>{role === "socialWorker" ? t.priority : t.changeScore}</span>
                <strong>{anomaly.gaugeValue}</strong>
              </div>
            </div>

            {role === "socialWorker" ? (
              <div className="caseSummary">
                <span>{t.caseSummary}</span>
                <strong>{localizeAdlLabel(adlState, language)}</strong>
                <p>{localizeAnomalyText(anomaly.currentText, language)}</p>
              </div>
            ) : null}

            <div className="privacyFeed" aria-label={t.privacyState}>
              <LockKeyhole aria-hidden="true" size={18} />
              <div>
                <strong>{hasSignal ? t.anonymizedDone : t.anonymizedWaiting}</strong>
                <span>{t.noRawDeviceInfo}</span>
              </div>
            </div>

            <button className="callButton" type="button">
              <Phone aria-hidden="true" size={18} />
              <span>{report.recommendedAction}</span>
            </button>

            <div className="phoneHomeIndicator" aria-hidden="true" />

            {showReason ? (
              <div className="checkReasonPopover" role="dialog" aria-label={t.closeReason}>
                <button
                  className="reasonCloseButton"
                  type="button"
                  aria-label={t.closeReason}
                  onClick={() => setShowReason(false)}
                >
                  {t.close}
                </button>
                <strong>
                  {role === "socialWorker"
                    ? t.phoneReasonWorkerTitle
                    : t.phoneReasonFamilyTitle}
                </strong>
                <p>{localizeAnomalyText(anomaly.reasonSummary, language)}</p>
                <p>
                  {role === "socialWorker"
                    ? t.phoneReasonWorkerCopy
                    : t.phoneReasonFamilyCopy}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function RoleSelection({
  language,
  onSelect
}: {
  language: Language;
  onSelect: (role: GuardianRole) => void;
}) {
  const t = copy[language];

  return (
    <div className="roleSelection" aria-labelledby="phone-title">
      <div className="roleSelectionHeader">
        <p className="eyebrow">{t.viewMode}</p>
        <h2 id="phone-title">{t.rolePrompt}</h2>
        <p>{t.roleDescription}</p>
      </div>

      <div className="roleOptionList">
        <button type="button" onClick={() => onSelect("family")}>
          <HeartHandshake aria-hidden="true" size={22} />
          <span>
            <strong>{t.familyRole}</strong>
            <small>{t.familyRoleHint}</small>
          </span>
        </button>
        <button type="button" onClick={() => onSelect("socialWorker")}>
          <BriefcaseBusiness aria-hidden="true" size={22} />
          <span>
            <strong>{t.socialWorkerRole}</strong>
            <small>{t.socialWorkerRoleHint}</small>
          </span>
        </button>
      </div>
    </div>
  );
}

function useTypedMessage(message: string) {
  const [typedMessage, setTypedMessage] = useState("");

  useEffect(() => {
    setTypedMessage("");
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTypedMessage(message.slice(0, index));

      if (index >= message.length) {
        window.clearInterval(intervalId);
      }
    }, 22);

    return () => window.clearInterval(intervalId);
  }, [message]);

  return typedMessage;
}

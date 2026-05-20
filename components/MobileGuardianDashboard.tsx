import { useEffect, useState } from "react";
import {
  BellRing,
  BriefcaseBusiness,
  HeartHandshake,
  LockKeyhole,
  Phone,
  ShieldCheck
} from "lucide-react";
import type {
  ADLState,
  AnomalyResult,
  GuardianReport,
  GuardianRole
} from "@/data/routineDataset";
import {
  copy,
  localizeAdlLabel,
  localizeAnomalyText,
  statusLabels,
  toneLabels,
  type Language
} from "@/lib/i18n";

type MobileGuardianDashboardProps = {
  report: GuardianReport;
  adlState: ADLState;
  anomaly: AnomalyResult;
  hasSignal: boolean;
  language: Language;
  role: GuardianRole | null;
  onRoleChange: (role: GuardianRole | null) => void;
};

export function MobileGuardianDashboard({
  report,
  adlState,
  anomaly,
  hasSignal,
  language,
  role,
  onRoleChange
}: MobileGuardianDashboardProps) {
  const typedMessage = useTypedMessage(report.message);
  const [showReason, setShowReason] = useState(false);
  const t = copy[language];

  useEffect(() => {
    setShowReason(false);
  }, [anomaly.severity, role]);

  if (!role) {
    return (
      <section className="mobileGuardianView roleSetup">
        <div className="mobileRoleCard">
          <ShieldCheck aria-hidden="true" size={28} />
          <p className="eyebrow">{t.viewMode}</p>
          <h2>{t.rolePrompt}</h2>
          <p>{t.roleDescription}</p>

          <div className="mobileRoleGrid">
            <button type="button" onClick={() => onRoleChange("family")}>
              <HeartHandshake aria-hidden="true" size={24} />
              <span>
                <strong>{t.familyRole}</strong>
                <small>{t.familyRoleHint}</small>
              </span>
            </button>
            <button type="button" onClick={() => onRoleChange("socialWorker")}>
              <BriefcaseBusiness aria-hidden="true" size={24} />
              <span>
                <strong>{t.socialWorkerRole}</strong>
                <small>{t.socialWorkerRoleHint}</small>
              </span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mobileGuardianView" aria-labelledby="mobile-report-title">
      <div className="mobileGuardianReportPane">
        <div className="mobileGuardianHeader">
          <div>
            <p className="eyebrow">{t.liveReport}</p>
            <h2 id="mobile-report-title">{report.title}</h2>
          </div>
          <span className={`statusPill ${report.tone}`}>
            {toneLabels[language][report.tone]}
          </span>
        </div>

        <div className="mobileReportBubble" aria-live="polite">
          <BellRing aria-hidden="true" size={20} />
          <div className="reportBubbleCopy">
            <p>{typedMessage}</p>
            {report.changeSummary ? <small>{report.changeSummary}</small> : null}
            {report.supportingSuggestion ? (
              <small>{report.supportingSuggestion}</small>
            ) : null}
          </div>
          <span className="typingCursor" aria-hidden="true" />
        </div>

        <button className="mobileCallButton" type="button">
          <Phone aria-hidden="true" size={18} />
          <span>{report.recommendedAction}</span>
        </button>
      </div>

      <aside className="mobileGuardianInsightPane">
        <div className="mobileGuardianToolbar">
          <span>GentleSight App</span>
          <button type="button" onClick={() => onRoleChange(null)}>
            {t.roleChange}
          </button>
        </div>

        <div className="mobileInsightGrid">
          <div
            className={`mobileInsightCard ${
              anomaly.severity === "caution" ? "needsReason" : ""
            }`}
          >
            <span>{t.status}</span>
            <strong>{statusLabels[language][anomaly.severity]}</strong>
            <p>{localizeAnomalyText(anomaly.currentText, language)}</p>
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

          <div className="mobileInsightCard">
            <span>{role === "socialWorker" ? t.priority : t.changeScore}</span>
            <strong>{anomaly.gaugeValue}</strong>
            <p>{localizeAdlLabel(adlState, language)}</p>
          </div>

          <div className="mobileInsightCard privacy">
            <LockKeyhole aria-hidden="true" size={18} />
            <span>{t.privacyState}</span>
            <strong>{hasSignal ? t.anonymizedDone : t.anonymizedWaiting}</strong>
            <p>{t.noRawDeviceInfo}</p>
          </div>
        </div>

        {role === "socialWorker" ? (
          <div className="mobileCaseSummary">
            <span>{t.caseSummary}</span>
            <strong>{localizeAdlLabel(adlState, language)}</strong>
            <p>{localizeAnomalyText(anomaly.currentText, language)}</p>
          </div>
        ) : null}

        {showReason ? (
          <div className="mobileReasonSheet" role="dialog" aria-label={t.closeReason}>
            <button type="button" onClick={() => setShowReason(false)}>
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
      </aside>
    </section>
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
    }, 18);

    return () => window.clearInterval(intervalId);
  }, [message]);

  return typedMessage;
}

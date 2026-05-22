import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BellRing,
  BriefcaseBusiness,
  HeartHandshake,
  ListChecks,
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
import {
  ReportGenerationStatus,
  UnresolvedCautionPage
} from "@/components/GuardianPhone";
import type { GuardianMessageCaution } from "@/lib/nilmLogic";

type MobileGuardianDashboardProps = {
  report: GuardianReport;
  isReportLoading: boolean;
  showReportGenerationStatus: boolean;
  adlState: ADLState;
  anomaly: AnomalyResult;
  currentAnomaly: AnomalyResult;
  previousUnresolvedCautions: GuardianMessageCaution[];
  hasSignal: boolean;
  language: Language;
  role: GuardianRole | null;
  onRoleChange: (role: GuardianRole | null) => void;
};

export function MobileGuardianDashboard({
  report,
  isReportLoading,
  showReportGenerationStatus,
  adlState,
  anomaly,
  currentAnomaly,
  previousUnresolvedCautions,
  hasSignal,
  language,
  role,
  onRoleChange
}: MobileGuardianDashboardProps) {
  const [showReason, setShowReason] = useState(false);
  const [reportPage, setReportPage] = useState<"report" | "unresolved">(
    "report"
  );
  const t = copy[language];
  const readingReport = useReadingReport(report, isReportLoading);
  const typedMessage = useTypedMessage(readingReport.message);
  const hasUnresolvedCautions = previousUnresolvedCautions.length > 0;

  useEffect(() => {
    setShowReason(false);
  }, [anomaly.severity, role]);

  useEffect(() => {
    if (!hasUnresolvedCautions) {
      setReportPage("report");
    }
  }, [hasUnresolvedCautions]);

  if (!role) {
    return (
      <section className="mobileGuardianView roleSetup">
        <div className="mobileRoleCard">
          <ShieldCheck aria-hidden="true" size={28} />
          <p className="eyebrow">{t.viewMode}</p>
          <h2>{t.rolePrompt}</h2>
          <p>{t.roleDescription}</p>

          <div className="mobileRoleGrid">
            <button
              className="familyRoleOption"
              type="button"
              onClick={() => onRoleChange("family")}
            >
              <HeartHandshake aria-hidden="true" size={24} />
              <span>
                <strong>{t.familyRole}</strong>
                <small>{t.familyRoleHint}</small>
              </span>
            </button>
            <button
              className="socialWorkerRoleOption"
              type="button"
              onClick={() => onRoleChange("socialWorker")}
            >
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
    <section
      className={`mobileGuardianView role-${role}`}
      aria-labelledby="mobile-report-title"
    >
      <div className="mobileGuardianReportPane">
        <div className="mobileGuardianHeader">
          <div>
            <div className="reportHeaderLine">
              <p className="eyebrow">{t.liveReport}</p>
              <ReportGenerationStatus
                isLoading={isReportLoading}
                isVisible={showReportGenerationStatus}
                language={language}
              />
            </div>
            <h2 id="mobile-report-title">{readingReport.title}</h2>
          </div>
          {anomaly.severity === currentAnomaly.severity ? (
            <span className={`statusPill ${report.tone}`}>
              {toneLabels[language][report.tone]}
            </span>
          ) : (
            <div className="phoneStatusPillStack">
              <span className={`statusPill ${severityToTone(anomaly.severity)}`}>
                {t.overallStatusLabel} {statusLabels[language][anomaly.severity]}
              </span>
              {currentAnomaly.severity !== "pending" && (
                <span className={`statusPill ${severityToTone(currentAnomaly.severity)}`}>
                  {t.nowStatusLabel} {statusLabels[language][currentAnomaly.severity]}
                </span>
              )}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {reportPage === "unresolved" ? (
            <motion.div
              key="unresolved"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              <UnresolvedCautionPage
                cautions={previousUnresolvedCautions}
                language={language}
                onBack={() => setReportPage("report")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="report"
              className="phoneReportPage"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="mobileReportBubble" aria-live="polite">
                <BellRing aria-hidden="true" size={20} />
                <div className="reportBubbleCopy">
                  <p>{typedMessage}</p>
                </div>
                <span className="typingCursor" aria-hidden="true" />
              </div>

              {hasUnresolvedCautions ? (
                <button
                  className="unresolvedSwitchButton"
                  type="button"
                  onClick={() => setReportPage("unresolved")}
                >
                  <ListChecks aria-hidden="true" size={16} />
                  <span>
                    {t.previousNeedsCheckButton.replace(
                      "{count}",
                      String(previousUnresolvedCautions.length)
                    )}
                  </span>
                </button>
              ) : null}

              {role !== "socialWorker" &&
              !isReportLoading &&
              (readingReport.changeSummary ||
                readingReport.supportingSuggestion) ? (
                <div className="mobileReportInsightGrid">
                  {readingReport.changeSummary ? (
                    <article>
                      <span>{t.changeSummaryLabel}</span>
                      <p>{readingReport.changeSummary}</p>
                    </article>
                  ) : null}
                  {readingReport.supportingSuggestion ? (
                    <article>
                      <span>{t.supportingSuggestionLabel}</span>
                      <p>{readingReport.supportingSuggestion}</p>
                    </article>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {role !== "socialWorker" ? (
          <button className="mobileCallButton" type="button">
            <Phone aria-hidden="true" size={18} />
            <span>{readingReport.recommendedAction}</span>
          </button>
        ) : null}
      </div>

      <aside className="mobileGuardianInsightPane">
        <div className="mobileGuardianToolbar">
          <span>GentleSight App</span>
          <div className="mobileRoleControls">
            <span className={`roleCurrentPill ${role}`}>
              {role === "socialWorker" ? t.socialWorkerRole : t.familyRole}
            </span>
            <button type="button" onClick={() => onRoleChange(null)}>
              {t.roleChange}
            </button>
          </div>
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
          </div>
        ) : null}

        <AnimatePresence>
          {showReason ? (
            <motion.div
              className="mobileReasonSheet"
              role="dialog"
              aria-label={t.closeReason}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
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
            </motion.div>
          ) : null}
        </AnimatePresence>
      </aside>
    </section>
  );
}

function severityToTone(
  severity: AnomalyResult["severity"]
): "calm" | "warm" | "alert" {
  if (severity === "caution") return "alert";
  if (severity === "watch") return "warm";
  return "calm";
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

function useReadingReport(report: GuardianReport, isReportLoading: boolean) {
  const [readingReport, setReadingReport] = useState(report);

  useEffect(() => {
    if (!isReportLoading) {
      setReadingReport(report);
    }
  }, [isReportLoading, report]);

  return readingReport;
}

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BellRing,
  BriefcaseBusiness,
  HeartHandshake,
  LockKeyhole,
  ListChecks,
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
import type { GuardianMessageCaution } from "@/lib/nilmLogic";

type GuardianPhoneProps = {
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

export function GuardianPhone({
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
}: GuardianPhoneProps) {
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

  return (
    <section className="phonePanel" aria-labelledby="phone-title">
      <div className={`phoneFrame ${role ? `role-${role}` : ""}`}>
        <div className="phoneTopBar">
          <span>GentleSight App</span>
          {role ? (
            <div className="phoneRoleControls">
              <span className={`roleCurrentPill ${role}`}>
                {role === "socialWorker" ? t.socialWorkerRole : t.familyRole}
              </span>
              <button
                className="roleChangeButton"
                type="button"
                onClick={() => onRoleChange(null)}
              >
                {t.roleChange}
              </button>
            </div>
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
                <div className="reportHeaderLine">
                  <p className="eyebrow">{t.liveReport}</p>
                  <ReportGenerationStatus
                    isLoading={isReportLoading}
                    isVisible={showReportGenerationStatus}
                    language={language}
                  />
                </div>
                <h2 id="phone-title">{readingReport.title}</h2>
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
                  <div className="reportBubble" aria-live="polite">
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
                    <div className="reportInsightStack">
                      {readingReport.changeSummary ? (
                        <article className="reportInsightCard">
                          <span>{t.changeSummaryLabel}</span>
                          <p>{readingReport.changeSummary}</p>
                        </article>
                      ) : null}
                      {readingReport.supportingSuggestion ? (
                        <article className="reportInsightCard suggestion">
                          <span>{t.supportingSuggestionLabel}</span>
                          <p>{readingReport.supportingSuggestion}</p>
                        </article>
                      ) : null}
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>

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
              </div>
            ) : null}

            <div className="privacyFeed" aria-label={t.privacyState}>
              <LockKeyhole aria-hidden="true" size={18} />
              <div>
                <strong>{hasSignal ? t.anonymizedDone : t.anonymizedWaiting}</strong>
                <span>{t.noRawDeviceInfo}</span>
              </div>
            </div>

            {role !== "socialWorker" ? (
              <button className="callButton" type="button">
                <Phone aria-hidden="true" size={18} />
                <span>{readingReport.recommendedAction}</span>
              </button>
            ) : null}

            <div className="phoneHomeIndicator" aria-hidden="true" />

            <AnimatePresence>
              {showReason ? (
                <motion.div
                  className="checkReasonPopover"
                  role="dialog"
                  aria-label={t.closeReason}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
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
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

export function ReportGenerationStatus({
  isLoading,
  isVisible,
  language
}: {
  isLoading: boolean;
  isVisible: boolean;
  language: Language;
}) {
  const t = copy[language];

  if (!isVisible) {
    return null;
  }

  return (
    <span
      className={`reportGenerationStatus ${isLoading ? "loading" : "ready"}`}
      aria-live="polite"
    >
      <span aria-hidden="true" />
      {isLoading ? t.reportStatusGenerating : t.reportStatusReady}
    </span>
  );
}

export function UnresolvedCautionPage({
  cautions,
  language,
  onBack
}: {
  cautions: GuardianMessageCaution[];
  language: Language;
  onBack: () => void;
}) {
  const t = copy[language];

  return (
    <div className="unresolvedCautionPage" aria-label={t.previousNeedsCheck}>
      <div className="unresolvedCautionHeader">
        <button type="button" onClick={onBack} aria-label={t.previousNeedsBack}>
          <ArrowLeft aria-hidden="true" size={16} />
        </button>
        <span>{t.previousNeedsCheck}</span>
      </div>

      <div className="unresolvedCautionStack">
        {cautions.map((caution) => (
          <article key={`${caution.groupId}-${caution.baseline.id}`}>
            <strong>
              {localizeAnomalyText(caution.anomaly.currentText, language)}
            </strong>
            <p>{localizeAnomalyText(caution.anomaly.reasonSummary, language)}</p>
          </article>
        ))}
      </div>
    </div>
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
        <button
          className="familyRoleOption"
          type="button"
          onClick={() => onSelect("family")}
        >
          <HeartHandshake aria-hidden="true" size={22} />
          <span>
            <strong>{t.familyRole}</strong>
            <small>{t.familyRoleHint}</small>
          </span>
        </button>
        <button
          className="socialWorkerRoleOption"
          type="button"
          onClick={() => onSelect("socialWorker")}
        >
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
    }, 22);

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

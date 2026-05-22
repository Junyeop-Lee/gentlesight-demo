"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import {
  BarChart3,
  Gauge,
  HeartPulse,
  Languages,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  X
} from "lucide-react";
import {
  applianceCatalog,
  interactionSlots,
  type AnomalyResult,
  type ApplianceEvent,
  type ApplianceId,
  type GuardianRole
} from "@/data/routineDataset";
import {
  createApplianceEvent,
  detectAnomaly,
  generateGuardianReport,
  inferAdlState,
  selectGuardianMessageContext
} from "@/lib/nilmLogic";
import {
  buildPrivacySafeAiInput,
  type PrivacySafeReportResponse
} from "@/lib/privacySafeAi";
import {
  DEFAULT_SIMULATION_MINUTES_PER_SECOND,
  FAST_SIMULATION_MINUTES_PER_SECOND,
  SIMULATION_END_MINUTES,
  SIMULATION_START_MINUTES,
  formatClock,
  formatLocalizedClock,
  getRoutinePhaseForMinutes
} from "@/lib/simulationClock";
import { copy, statusLabels, type Language } from "@/lib/i18n";
import {
  GlobalActionBar,
  type ActionPanel
} from "@/components/GlobalActionBar";
import { GuardianPhone } from "@/components/GuardianPhone";
import { HomeSimulator } from "@/components/HomeSimulator";
import {
  BaselineComparisonPanel,
  StatusPanel
} from "@/components/LivingRhythmPanels";
import { MobileGuardianDashboard } from "@/components/MobileGuardianDashboard";
import {
  MobileModeShell,
  type MobileInfoMode
} from "@/components/MobileModeShell";
import { PrivacyPanel } from "@/components/PrivacyPanel";

type DetailPanel = ActionPanel | null;
type MobileMode = "interaction" | MobileInfoMode;
type AiReportStatus = "idle" | "loading" | "ready" | "fallback";

const MOBILE_APP_QUERY =
  "(max-width: 1024px) and (orientation: landscape)";

export function NilmGuardianDemo() {
  const [events, setEvents] = useState<ApplianceEvent[]>([]);
  const [detailPanel, setDetailPanel] = useState<DetailPanel>(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [mobileMode, setMobileMode] = useState<MobileMode>("interaction");
  const [guardianRole, setGuardianRole] = useState<GuardianRole | null>(null);
  const [currentMinutes, setCurrentMinutes] = useState(
    SIMULATION_START_MINUTES
  );
  const [isClockRunning, setIsClockRunning] = useState(true);
  const [isFastPreview, setIsFastPreview] = useState(false);
  const [language, setLanguage] = useState<Language>("ko");
  const isMobileAppViewport = useMediaQuery(MOBILE_APP_QUERY);
  const mobileHistoryEntryRef = useRef(false);
  const previousMobileModeRef = useRef<MobileMode>("interaction");
  const aiReportCacheRef = useRef(new Map<string, PrivacySafeReportResponse>());
  const [aiReport, setAiReport] = useState<PrivacySafeReportResponse | null>(
    null
  );
  const [aiReportStatus, setAiReportStatus] =
    useState<AiReportStatus>("idle");

  const currentTime = formatClock(currentMinutes);
  const localizedTime = formatLocalizedClock(currentMinutes, language);
  const t = copy[language];
  const clockSpeed = isFastPreview
    ? FAST_SIMULATION_MINUTES_PER_SECOND
    : DEFAULT_SIMULATION_MINUTES_PER_SECOND;

  const latestEvent = events.at(-1);
  const activeGuardianRole = guardianRole ?? "family";
  const adlState = useMemo(
    () => inferAdlState(events, currentMinutes),
    [events, currentMinutes]
  );
  const anomaly = useMemo(
    () => detectAnomaly(events, currentMinutes),
    [events, currentMinutes]
  );
  const messageContext = useMemo(
    () => selectGuardianMessageContext(events, currentMinutes),
    [events, currentMinutes]
  );
  const messageAnomaly = messageContext.anomaly;
  const guardianReport = useMemo(
    () =>
      generateGuardianReport(
        adlState,
        messageAnomaly,
        latestEvent,
        activeGuardianRole,
        language
      ),
    [adlState, messageAnomaly, latestEvent, activeGuardianRole, language]
  );
  const reportInput = useMemo(
    () =>
      buildPrivacySafeAiInput({
        adlState,
        anomaly: messageAnomaly,
        report: guardianReport,
        role: activeGuardianRole,
        eventCount: events.length,
        language
      }),
    [
      adlState,
      messageAnomaly,
      guardianReport,
      activeGuardianRole,
      events.length,
      language
    ]
  );
  const reportInputSignature = useMemo(
    () => JSON.stringify(reportInput),
    [reportInput]
  );
  const aiReportGenerationKey = useMemo(
    () =>
      messageContext.aiGenerationKey
        ? [
            messageContext.aiGenerationKey,
            activeGuardianRole,
            language
          ].join(":")
        : null,
    [messageContext.aiGenerationKey, activeGuardianRole, language]
  );
  const displayedGuardianReport = useMemo(
    () =>
      aiReport?.source === "openai"
        ? {
            ...guardianReport,
            message: aiReport.message,
            supportingSuggestion: aiReport.supportingSuggestion,
            changeSummary: aiReport.changeSummary
          }
        : guardianReport,
    [guardianReport, aiReport]
  );
  const isAiReportLoading =
    guardianRole !== null &&
    Boolean(aiReportGenerationKey) &&
    aiReportStatus === "loading";
  const showReportGenerationStatus =
    Boolean(aiReportGenerationKey) &&
    (aiReportStatus === "loading" ||
      aiReportStatus === "ready" ||
      aiReportStatus === "fallback");
  const homeLighting = useMemo(
    () => getHomeLighting(currentMinutes, events),
    [currentMinutes, events]
  );

  useEffect(() => {
    if (!isClockRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentMinutes((minutes) =>
        Math.min(minutes + clockSpeed, SIMULATION_END_MINUTES)
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [clockSpeed, isClockRunning]);

  useEffect(() => {
    if (currentMinutes >= SIMULATION_END_MINUTES && isClockRunning) {
      setIsClockRunning(false);
    }
  }, [currentMinutes, isClockRunning]);

  useEffect(() => {
    if (!guardianRole || !aiReportGenerationKey) {
      setAiReport(null);
      setAiReportStatus("idle");
      return;
    }

    const cachedReport = aiReportCacheRef.current.get(aiReportGenerationKey);
    if (cachedReport) {
      setAiReport(cachedReport);
      setAiReportStatus(
        cachedReport.source === "openai" ? "ready" : "fallback"
      );
      return;
    }

    setAiReport(null);
    setAiReportStatus("loading");
    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: reportInputSignature,
        signal: abortController.signal
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((response: PrivacySafeReportResponse | null) => {
          const isValidReport = Boolean(
            response &&
              typeof response.message === "string" &&
              typeof response.supportingSuggestion === "string" &&
              typeof response.changeSummary === "string" &&
              response.message.trim() &&
              response.supportingSuggestion.trim() &&
              response.changeSummary.trim()
          );

          if (isValidReport && response) {
            const report = {
              ...response,
              message: response.message.trim(),
              supportingSuggestion: response.supportingSuggestion.trim(),
              changeSummary: response.changeSummary.trim()
            };
            aiReportCacheRef.current.set(aiReportGenerationKey, report);
            setAiReport(report);
            setAiReportStatus(
              response.source === "openai" ? "ready" : "fallback"
            );
            return;
          }

          setAiReport(null);
          setAiReportStatus("fallback");
        })
        .catch(() => {
          if (!abortController.signal.aborted) {
            setAiReport(null);
            setAiReportStatus("fallback");
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [guardianRole, aiReportGenerationKey]);

  useEffect(() => {
    if (!isMobileAppViewport && mobileMode !== "interaction") {
      setMobileMode("interaction");
    }
  }, [isMobileAppViewport, mobileMode]);

  useEffect(() => {
    if (!isMobileAppViewport) {
      mobileHistoryEntryRef.current = false;
      previousMobileModeRef.current = mobileMode;
      return;
    }

    if (
      previousMobileModeRef.current === "interaction" &&
      mobileMode !== "interaction" &&
      !mobileHistoryEntryRef.current
    ) {
      window.history.pushState(
        { gentleSightMobileMode: mobileMode },
        "",
        window.location.href
      );
      mobileHistoryEntryRef.current = true;
    }

    if (mobileMode === "interaction") {
      mobileHistoryEntryRef.current = false;
    }

    previousMobileModeRef.current = mobileMode;
  }, [isMobileAppViewport, mobileMode]);

  useEffect(() => {
    const handlePopState = () => {
      if (isMobileAppViewport) {
        setMobileMode("interaction");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMobileAppViewport]);

  const handleApplianceClick = useCallback(
    (applianceId: ApplianceId) => {
      setEvents((currentEvents) => {
        if (currentEvents.length >= interactionSlots.length) {
          return currentEvents;
        }

        const currentPhase = getRoutinePhaseForMinutes(currentMinutes);
        const phaseEventIndex = currentEvents.filter(
          (event) => event.phase === currentPhase
        ).length;

        return [
          ...currentEvents,
          createApplianceEvent(
            applianceId,
            currentEvents.length,
            currentTime,
            phaseEventIndex
          )
        ];
      });
    },
    [currentMinutes, currentTime]
  );

  const handleReset = useCallback(() => {
    setEvents([]);
    setCurrentMinutes(SIMULATION_START_MINUTES);
    setIsClockRunning(true);
    setDetailPanel(null);
    setMobileMode("interaction");
    setAiReport(null);
    setAiReportStatus("idle");
  }, []);

  const handleMobileModeSelect = useCallback((mode: MobileInfoMode) => {
    setMobileMode(mode);
    setDetailPanel(null);
    setIsPhoneOpen(false);
  }, []);

  const handleMobileModeBack = useCallback(() => {
    setMobileMode("interaction");

    if (mobileHistoryEntryRef.current) {
      mobileHistoryEntryRef.current = false;
      window.history.back();
    }
  }, []);

  const mobileInfoMode = mobileMode === "interaction" ? null : mobileMode;

  return (
    <main
      className={`appShell ${
        isMobileAppViewport ? "mobileAppShell" : ""
      } mobileMode-${mobileMode}`}
      id="main-content"
    >
      <MotionConfig reducedMotion="user">
        <div className="landscapePrompt">
          <Smartphone
            aria-hidden="true"
            size={48}
            style={{ marginBottom: 16, transform: "rotate(90deg)" }}
          />
          <h2>{t.landscapeTitle}</h2>
          <p>{t.landscapeDescription}</p>
        </div>
        
        <HomeSimulator
          appliances={applianceCatalog}
          onApplianceClick={handleApplianceClick}
          disabled={events.length >= interactionSlots.length}
          lightingLevel={homeLighting}
          language={language}
        >
          <div className="homeChrome" aria-label={t.simulationControls}>
            <div className="compactBrand">
              <p className="eyebrow">{t.interactiveHome}</p>
              <h1 id="home-title">GentleSight</h1>
            </div>

            <div className="topControls" aria-label={t.simulationControls}>
              <div className="languageToggle" aria-label={t.languageToggleLabel}>
                <Languages aria-hidden="true" size={17} />
                <button
                  className={language === "ko" ? "selected" : ""}
                  type="button"
                  aria-pressed={language === "ko"}
                  onClick={() => setLanguage("ko")}
                >
                  {t.korean}
                </button>
                <button
                  className={language === "en" ? "selected" : ""}
                  type="button"
                  aria-pressed={language === "en"}
                  onClick={() => setLanguage("en")}
                >
                  {t.english}
                </button>
              </div>
              <div className="clockControlPanel" aria-label={t.clockControl}>
                <div className="clockReadout" aria-live="polite">
                  <span>{t.currentTime}</span>
                  <strong>{localizedTime}</strong>
                  <small>{isClockRunning ? t.autoFlow : t.paused}</small>
                </div>
                <button
                  className="iconButton"
                  type="button"
                  aria-label={isClockRunning ? t.pauseTime : t.playTime}
                  aria-pressed={isClockRunning}
                  onClick={() => setIsClockRunning((running) => !running)}
                >
                  {isClockRunning ? (
                    <Pause aria-hidden="true" size={18} />
                  ) : (
                    <Play aria-hidden="true" size={18} />
                  )}
                </button>
                <button
                  className={`iconButton ${isFastPreview ? "selected" : ""}`}
                  type="button"
                  aria-label={t.fastPreview}
                  aria-pressed={isFastPreview}
                  onClick={() => setIsFastPreview((fast) => !fast)}
                >
                  <Gauge aria-hidden="true" size={18} />
                </button>
                <button
                  className="iconButton"
                  type="button"
                  aria-label={t.resetSimulation}
                  onClick={handleReset}
                >
                  <RotateCcw aria-hidden="true" size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="demoInputHint" aria-live="polite">
            <span>{t.livingSignalSimulation}</span>
            {messageAnomaly.severity === anomaly.severity ? (
              anomaly.severity !== "pending" ? (
                <span className={`demoStatusPill ${severityToTone(anomaly.severity)}`}>
                  {statusLabels[language][anomaly.severity]}
                </span>
              ) : null
            ) : (
              <>
                <span className={`demoStatusPill ${severityToTone(messageAnomaly.severity)}`}>
                  {t.overallStatusLabel} {statusLabels[language][messageAnomaly.severity]}
                </span>
                {anomaly.severity !== "pending" && (
                  <span className={`demoStatusPill ${severityToTone(anomaly.severity)}`}>
                    {t.nowStatusLabel} {statusLabels[language][anomaly.severity]}
                  </span>
                )}
              </>
            )}
          </div>

          {detailPanel ? (
            <div className="floatingDetailPanel" role="dialog" aria-modal="false">
              <button
                className="closePanelButton"
                type="button"
                aria-label={t.closeDetailPanel}
                onClick={() => setDetailPanel(null)}
              >
                <X aria-hidden="true" size={18} />
              </button>
              {detailPanel === "privacy" ? (
                <PrivacyPanel events={events} language={language} />
              ) : detailPanel === "comparison" ? (
                <BaselineComparisonPanel
                  anomaly={anomaly}
                  events={events}
                  currentMinutes={currentMinutes}
                  currentTimeLabel={localizedTime}
                  language={language}
                />
              ) : (
                <StatusPanel
                  adlState={adlState}
                  anomaly={anomaly}
                  events={events}
                  hasSignal={Boolean(latestEvent)}
                  currentMinutes={currentMinutes}
                  currentTimeLabel={localizedTime}
                  language={language}
                />
              )}
            </div>
          ) : null}

          <div className="bottomAppLayout">
            <GlobalActionBar
              activePanel={detailPanel}
              language={language}
              onSelectPanel={(panel) => {
                setDetailPanel((current) => (current === panel ? null : panel));
                setIsPhoneOpen(false);
              }}
            />
          </div>

          <nav className="mobileActionDock" aria-label={t.actionBarLabel}>
            <button
              className={mobileMode === "guardian" ? "selected" : ""}
              type="button"
              aria-pressed={mobileMode === "guardian"}
              onClick={() => handleMobileModeSelect("guardian")}
            >
              <Smartphone aria-hidden="true" size={18} />
              <span>Guardian</span>
            </button>
            <button
              className={mobileMode === "status" ? "selected" : ""}
              type="button"
              aria-pressed={mobileMode === "status"}
              onClick={() => handleMobileModeSelect("status")}
            >
              <HeartPulse aria-hidden="true" size={18} />
              <span>{t.statusView}</span>
            </button>
            <button
              className={mobileMode === "comparison" ? "selected" : ""}
              type="button"
              aria-pressed={mobileMode === "comparison"}
              onClick={() => handleMobileModeSelect("comparison")}
            >
              <BarChart3 aria-hidden="true" size={18} />
              <span>{t.comparison}</span>
            </button>
            <button
              className={mobileMode === "privacy" ? "selected" : ""}
              type="button"
              aria-pressed={mobileMode === "privacy"}
              onClick={() => handleMobileModeSelect("privacy")}
            >
              <ShieldCheck aria-hidden="true" size={18} />
              <span>{t.privacySummary}</span>
            </button>
          </nav>

          {isPhoneOpen ? (
            <div className="phoneOverlay" id="guardian-phone-panel">
              <GuardianPhone
                report={displayedGuardianReport}
                isReportLoading={isAiReportLoading}
                showReportGenerationStatus={showReportGenerationStatus}
                adlState={adlState}
                anomaly={messageAnomaly}
                currentAnomaly={anomaly}
                previousUnresolvedCautions={
                  messageContext.previousUnresolvedCautions
                }
                hasSignal={Boolean(latestEvent)}
                language={language}
                role={guardianRole}
                onRoleChange={setGuardianRole}
              />
            </div>
          ) : null}

          <button
            className={`phoneToggleButton ${
              messageAnomaly.severity === "caution" ? "needsAttention" : ""
            }`}
            type="button"
            aria-label={t.guardianPhone}
            aria-controls="guardian-phone-panel"
            aria-expanded={isPhoneOpen}
            onClick={() => {
              setIsPhoneOpen((open) => {
                if (!open) setDetailPanel(null);
                return !open;
              });
            }}
          >
            {isPhoneOpen ? (
              <X aria-hidden="true" size={28} />
            ) : (
              <>
                <Smartphone aria-hidden="true" size={28} />
                {messageAnomaly.severity === "caution" ? (
                  <span className="phoneNotificationBadge">
                    {displayedGuardianReport.notificationLabel}
                  </span>
                ) : null}
              </>
            )}
          </button>

          {isMobileAppViewport && mobileInfoMode ? (
            <MobileModeShell
              activeMode={mobileInfoMode}
              language={language}
              onBack={handleMobileModeBack}
              onModeChange={handleMobileModeSelect}
            >
              {mobileInfoMode === "guardian" ? (
                <MobileGuardianDashboard
                  report={displayedGuardianReport}
                  isReportLoading={isAiReportLoading}
                  showReportGenerationStatus={showReportGenerationStatus}
                  adlState={adlState}
                  anomaly={messageAnomaly}
                  currentAnomaly={anomaly}
                  previousUnresolvedCautions={
                    messageContext.previousUnresolvedCautions
                  }
                  hasSignal={Boolean(latestEvent)}
                  language={language}
                  role={guardianRole}
                  onRoleChange={setGuardianRole}
                />
              ) : mobileInfoMode === "privacy" ? (
                <PrivacyPanel events={events} language={language} />
              ) : mobileInfoMode === "comparison" ? (
                <BaselineComparisonPanel
                  anomaly={anomaly}
                  events={events}
                  currentMinutes={currentMinutes}
                  currentTimeLabel={localizedTime}
                  language={language}
                />
              ) : (
                <StatusPanel
                  adlState={adlState}
                  anomaly={anomaly}
                  events={events}
                  hasSignal={Boolean(latestEvent)}
                  currentMinutes={currentMinutes}
                  currentTimeLabel={localizedTime}
                  language={language}
                />
              )}
            </MobileModeShell>
          ) : null}
        </HomeSimulator>
      </MotionConfig>
    </main>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = () => setMatches(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

function severityToTone(
  severity: AnomalyResult["severity"]
): "calm" | "warm" | "alert" {
  if (severity === "caution") return "alert";
  if (severity === "watch") return "warm";
  return "calm";
}

function getHomeLighting(currentMinutes: number, events: ApplianceEvent[]) {
  const hasLightInput = events.some((event) => event.appliance === "light");
  const hour = Math.floor((currentMinutes % (24 * 60)) / 60);

  if (hasLightInput) {
    return 1.03;
  }

  if (hour < 8) {
    return 0.93;
  }

  if (hour >= 19) {
    return 0.88;
  }

  if (hour >= 17) {
    return 0.96;
  }

  return 1;
}

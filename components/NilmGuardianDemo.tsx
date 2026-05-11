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
  type ApplianceEvent,
  type ApplianceId,
  type GuardianRole
} from "@/data/routineDataset";
import {
  createApplianceEvent,
  detectAnomaly,
  generateGuardianReport,
  inferAdlState
} from "@/lib/nilmLogic";
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

  const currentTime = formatClock(currentMinutes);
  const localizedTime = formatLocalizedClock(currentMinutes, language);
  const t = copy[language];
  const clockSpeed = isFastPreview
    ? FAST_SIMULATION_MINUTES_PER_SECOND
    : DEFAULT_SIMULATION_MINUTES_PER_SECOND;

  const latestEvent = events.at(-1);
  const adlState = useMemo(
    () => inferAdlState(events, currentMinutes),
    [events, currentMinutes]
  );
  const anomaly = useMemo(
    () => detectAnomaly(events, currentMinutes),
    [events, currentMinutes]
  );
  const guardianReport = useMemo(
    () =>
      generateGuardianReport(
        adlState,
        anomaly,
        latestEvent,
        guardianRole ?? "family",
        language
      ),
    [adlState, anomaly, latestEvent, guardianRole, language]
  );
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
            <strong>{statusLabels[language][anomaly.severity]}</strong>
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
                  currentTimeLabel={localizedTime}
                  language={language}
                />
              ) : (
                <StatusPanel
                  adlState={adlState}
                  anomaly={anomaly}
                  hasSignal={Boolean(latestEvent)}
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
              onSelectPanel={(panel) =>
                setDetailPanel((current) => (current === panel ? null : panel))
              }
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
                report={guardianReport}
                adlState={adlState}
                anomaly={anomaly}
                hasSignal={Boolean(latestEvent)}
                language={language}
                role={guardianRole}
                onRoleChange={setGuardianRole}
              />
            </div>
          ) : null}

          <button
            className={`phoneToggleButton ${
              anomaly.severity === "caution" ? "needsAttention" : ""
            }`}
            type="button"
            aria-label={t.guardianPhone}
            aria-controls="guardian-phone-panel"
            aria-expanded={isPhoneOpen}
            onClick={() => setIsPhoneOpen(!isPhoneOpen)}
          >
            {isPhoneOpen ? (
              <X aria-hidden="true" size={28} />
            ) : (
              <>
                <Smartphone aria-hidden="true" size={28} />
                {anomaly.severity === "caution" ? (
                  <span className="phoneNotificationBadge">
                    {guardianReport.notificationLabel}
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
                  report={guardianReport}
                  adlState={adlState}
                  anomaly={anomaly}
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
                  currentTimeLabel={localizedTime}
                  language={language}
                />
              ) : (
                <StatusPanel
                  adlState={adlState}
                  anomaly={anomaly}
                  hasSignal={Boolean(latestEvent)}
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

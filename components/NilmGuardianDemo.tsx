"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";
import {
  Gauge,
  Pause,
  Play,
  RotateCcw,
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
  formatKoreanClock,
  getRoutinePhaseForMinutes
} from "@/lib/simulationClock";
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
import { PrivacyPanel } from "@/components/PrivacyPanel";

type DetailPanel = ActionPanel | null;

export function NilmGuardianDemo() {
  const [events, setEvents] = useState<ApplianceEvent[]>([]);
  const [detailPanel, setDetailPanel] = useState<DetailPanel>(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [guardianRole, setGuardianRole] = useState<GuardianRole | null>(null);
  const [currentMinutes, setCurrentMinutes] = useState(
    SIMULATION_START_MINUTES
  );
  const [isClockRunning, setIsClockRunning] = useState(true);
  const [isFastPreview, setIsFastPreview] = useState(false);

  const currentTime = formatClock(currentMinutes);
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
        guardianRole ?? "family"
      ),
    [adlState, anomaly, latestEvent, guardianRole]
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
  }, []);

  return (
    <main className="appShell" id="main-content">
      <MotionConfig reducedMotion="user">
        <div className="landscapePrompt">
          <Smartphone
            aria-hidden="true"
            size={48}
            style={{ marginBottom: 16, transform: "rotate(90deg)" }}
          />
          <h2>가로 화면으로 전환해주세요</h2>
          <p>이 화면은 가로 모드 및 데스크탑 환경에 최적화된 프로토타입입니다.</p>
        </div>
        
        <HomeSimulator
          appliances={applianceCatalog}
          onApplianceClick={handleApplianceClick}
          disabled={events.length >= interactionSlots.length}
          lightingLevel={homeLighting}
        >
          <div className="homeChrome" aria-label="홈 시뮬레이션 제어">
            <div className="compactBrand">
              <p className="eyebrow">Interactive Home</p>
              <h1 id="home-title">GentleSight</h1>
            </div>

            <div className="topControls" aria-label="시뮬레이션 제어">
              <div className="clockControlPanel" aria-label="시간 흐름 제어">
                <div className="clockReadout" aria-live="polite">
                  <span>현재 시간</span>
                  <strong>{formatKoreanClock(currentMinutes)}</strong>
                  <small>{isClockRunning ? "자동 흐름" : "일시정지"}</small>
                </div>
                <button
                  className="iconButton"
                  type="button"
                  aria-label={isClockRunning ? "시간 일시정지" : "시간 재생"}
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
                  aria-label="빠르게 보기"
                  aria-pressed={isFastPreview}
                  onClick={() => setIsFastPreview((fast) => !fast)}
                >
                  <Gauge aria-hidden="true" size={18} />
                </button>
                <button
                  className="iconButton"
                  type="button"
                  aria-label="시뮬레이션 초기화"
                  onClick={handleReset}
                >
                  <RotateCcw aria-hidden="true" size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="demoInputHint" aria-live="polite">
            <span>생활 신호 시뮬레이션</span>
            <strong>{anomaly.statusLabel}</strong>
          </div>

          {detailPanel ? (
            <div className="floatingDetailPanel" role="dialog" aria-modal="false">
              <button
                className="closePanelButton"
                type="button"
                aria-label="세부 패널 닫기"
                onClick={() => setDetailPanel(null)}
              >
                <X aria-hidden="true" size={18} />
              </button>
              {detailPanel === "privacy" ? (
                <PrivacyPanel events={events} />
              ) : detailPanel === "comparison" ? (
                <BaselineComparisonPanel
                  anomaly={anomaly}
                  currentTimeLabel={formatKoreanClock(currentMinutes)}
                />
              ) : (
                <StatusPanel
                  adlState={adlState}
                  anomaly={anomaly}
                  hasSignal={Boolean(latestEvent)}
                  currentTimeLabel={formatKoreanClock(currentMinutes)}
                />
              )}
            </div>
          ) : null}

          <div className="bottomAppLayout">
            <GlobalActionBar
              activePanel={detailPanel}
              onSelectPanel={(panel) =>
                setDetailPanel((current) => (current === panel ? null : panel))
              }
            />
          </div>

          {isPhoneOpen ? (
            <div className="phoneOverlay" id="guardian-phone-panel">
              <GuardianPhone
                report={guardianReport}
                adlState={adlState}
                anomaly={anomaly}
                hasSignal={Boolean(latestEvent)}
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
            aria-label="보호자 핸드폰 보기"
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
        </HomeSimulator>
      </MotionConfig>
    </main>
  );
}

function getHomeLighting(currentMinutes: number, events: ApplianceEvent[]) {
  const hasLightInput = events.some((event) => event.appliance === "light");
  const hour = Math.floor(currentMinutes / 60);

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

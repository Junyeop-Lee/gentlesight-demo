"use client";

import { useCallback, useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";
import { ShieldCheck, RotateCcw, X, Smartphone } from "lucide-react";
import {
  applianceCatalog,
  interactionSlots,
  type ApplianceEvent,
  type ApplianceId
} from "@/data/routineDataset";
import {
  createApplianceEvent,
  detectAnomaly,
  generateGuardianReport,
  inferAdlState,
  type ScenarioMode
} from "@/lib/nilmLogic";
import { GuardianPhone } from "@/components/GuardianPhone";
import { HomeSimulator } from "@/components/HomeSimulator";
import { PipelineDock } from "@/components/PipelineDock";
import { PipelineVisualizer } from "@/components/PipelineVisualizer";
import { PrivacyPanel } from "@/components/PrivacyPanel";
import { Timeline } from "@/components/Timeline";

type DetailPanel = "privacy" | "pipeline" | null;

export function NilmGuardianDemo() {
  const [events, setEvents] = useState<ApplianceEvent[]>([]);
  const [scenarioMode, setScenarioMode] = useState<ScenarioMode>("delayed");
  const [detailPanel, setDetailPanel] = useState<DetailPanel>(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);

  const latestEvent = events.at(-1);
  const adlState = useMemo(() => inferAdlState(events), [events]);
  const anomaly = useMemo(
    () => detectAnomaly(events, scenarioMode),
    [events, scenarioMode]
  );
  const guardianReport = useMemo(
    () => generateGuardianReport(adlState, anomaly, latestEvent),
    [adlState, anomaly, latestEvent]
  );

  const progress = Math.min(events.length / interactionSlots.length, 1);

  const handleApplianceClick = useCallback(
    (applianceId: ApplianceId) => {
      setEvents((currentEvents) => {
        if (currentEvents.length >= interactionSlots.length) {
          return currentEvents;
        }

        return [
          ...currentEvents,
          createApplianceEvent(applianceId, currentEvents.length, scenarioMode)
        ];
      });
    },
    [scenarioMode]
  );

  const handleScenarioChange = useCallback((mode: ScenarioMode) => {
    setScenarioMode(mode);
    setEvents([]);
  }, []);

  const handleReset = useCallback(() => {
    setEvents([]);
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
        
        <div className="splitLayout">
          <div className="leftPane">
            <HomeSimulator
              appliances={applianceCatalog}
              onApplianceClick={handleApplianceClick}
              disabled={events.length >= interactionSlots.length}
            >
              <div className="homeChrome" aria-label="홈 시뮬레이션 제어">
                <div className="compactBrand">
                  <p className="eyebrow">Interactive Home</p>
                  <h1 id="home-title">GentleSight</h1>
                </div>

                <div className="topControls" aria-label="시나리오 제어">
                  <div className="segmentedControl" role="group" aria-label="루틴 모드">
                    <button
                      className={scenarioMode === "baseline" ? "selected" : ""}
                      type="button"
                      aria-pressed={scenarioMode === "baseline"}
                      onClick={() => handleScenarioChange("baseline")}
                    >
                      평소
                    </button>
                    <button
                      className={scenarioMode === "delayed" ? "selected" : ""}
                      type="button"
                      aria-pressed={scenarioMode === "delayed"}
                      onClick={() => handleScenarioChange("delayed")}
                    >
                      지연
                    </button>
                  </div>
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

              {!isPhoneOpen && (
                <>
                  <div className="timelineOverlay">
                    <Timeline events={events} progress={progress} />
                  </div>

                  <div className="pipelineOverlay">
                    <PipelineDock
                      adlState={adlState}
                      anomaly={anomaly}
                      hasSignal={Boolean(latestEvent)}
                      onOpenDetails={() => setDetailPanel(detailPanel === "pipeline" ? null : "pipeline")}
                    />
                  </div>
                  
                  <button
                    className="wavePeekButton"
                    type="button"
                    onClick={() => setDetailPanel(detailPanel === "privacy" ? null : "privacy")}
                  >
                    <ShieldCheck aria-hidden="true" size={18} />
                    <span>프라이버시 요약</span>
                  </button>
                </>
              )}

              {detailPanel && !isPhoneOpen ? (
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
                    <PrivacyPanel event={latestEvent} />
                  ) : (
                    <PipelineVisualizer
                      adlState={adlState}
                      anomaly={anomaly}
                      hasSignal={Boolean(latestEvent)}
                    />
                  )}
                </div>
              ) : null}

              <button
                className="phoneToggleButton"
                type="button"
                aria-label="보호자 핸드폰 보기"
                aria-controls="guardian-phone-panel"
                aria-expanded={isPhoneOpen}
                onClick={() => setIsPhoneOpen(!isPhoneOpen)}
              >
                {isPhoneOpen ? (
                  <X aria-hidden="true" size={28} />
                ) : (
                  <Smartphone aria-hidden="true" size={28} />
                )}
              </button>
            </HomeSimulator>
          </div>

          {isPhoneOpen && (
            <div className="rightPane" id="guardian-phone-panel">
              <GuardianPhone
                report={guardianReport}
                adlState={adlState}
                anomaly={anomaly}
                hasSignal={Boolean(latestEvent)}
              />
            </div>
          )}
        </div>
      </MotionConfig>
    </main>
  );
}

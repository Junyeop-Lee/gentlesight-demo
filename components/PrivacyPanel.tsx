import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { type ApplianceEvent } from "@/data/routineDataset";
import { privacySafeSignalLabel } from "@/lib/nilmLogic";

type PrivacyPanelProps = {
  events: ApplianceEvent[];
};

export function PrivacyPanel({ events }: PrivacyPanelProps) {
  const [unlockStep, setUnlockStep] = useState<"locked" | "confirm" | "raw">(
    "locked"
  );
  const hasEvents = events.length > 0;

  useEffect(() => {
    setUnlockStep("locked");
  }, [events.length]);

  return (
    <section className="wavePanel" aria-labelledby="privacy-title">
      <div className="sectionHeader compact">
        <div>
          <p className="eyebrow">Privacy Layer</p>
          <h2 id="privacy-title">프라이버시 요약</h2>
        </div>
        <ShieldCheck aria-hidden="true" size={20} />
      </div>

      <div className="waveBody">
        <AnimatePresence mode="wait">
          <motion.div
            key={unlockStep}
            className="privacyContent expanded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="privacyIcon">
              {unlockStep === "raw" ? (
                <CheckCircle2 aria-hidden="true" size={28} />
              ) : (
                <LockKeyhole aria-hidden="true" size={28} />
              )}
            </div>
            <div className="privacyCopy">
              <strong>GentleSight는 생활을 감시하지 않고 변화만 요약합니다.</strong>
              <p>
                보호자 화면과 향후 AI 입력에는 기기별 기록이 아니라 생활 리듬
                상태, 기준선 변화, 권장 조치만 전달됩니다.
              </p>
            </div>

            <div className="privacyPromiseGrid">
              <span>카메라 없이</span>
              <span>원천 데이터 숨김</span>
              <span>생활 리듬 요약</span>
            </div>

            {unlockStep === "locked" ? (
              <button
                className="privacyUnlockButton"
                type="button"
                disabled={!hasEvents}
                onClick={() => setUnlockStep("confirm")}
              >
                <LockKeyhole aria-hidden="true" size={18} />
                <span>
                  {hasEvents
                    ? "교육용 원천 처리 보기"
                    : "데모 입력 후 처리 로그 보기"}
                </span>
              </button>
            ) : null}

            {unlockStep === "confirm" ? (
              <div className="privacyConfirm">
                <strong>프로토타입 설명용 처리 로그입니다.</strong>
                <p>
                  실제 보호자 리포트에는 기기별 사용 기록이 직접 표시되지
                  않습니다. 지금 화면은 사용자가 만든 데모 입력이 어떻게
                  비식별 요약으로 바뀌는지 설명하기 위한 것입니다.
                </p>
                <button type="button" onClick={() => setUnlockStep("raw")}>
                  이해했습니다
                </button>
              </div>
            ) : null}

            {unlockStep === "raw" ? (
              <>
                <div className="processingSteps" aria-label="원천 데이터 처리 단계">
                  <span>원천 신호</span>
                  <span>비식별 처리</span>
                  <span>리포트 반영</span>
                </div>

                <div className="processingLogList">
                  {events.map((event) => (
                    <ProcessingLog event={event} key={event.id} />
                  ))}
                </div>

                <p className="privacyFootnote">
                  위 값은 프로토타입 교육용으로만 열람됩니다. 실제 보호자
                  리포트와 AI API에는 상태, 변화 정도, 권장 조치 요약만
                  전달됩니다.
                </p>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function ProcessingLog({ event }: { event: ApplianceEvent }) {
  return (
    <motion.div
      className="rawDataPanel processingLog"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <dl>
        <div>
          <dt>원천 신호</dt>
          <dd>{event.applianceLabel} 입력 감지</dd>
        </div>
        <div>
          <dt>비식별 처리</dt>
          <dd>{privacySafeSignalLabel(event)}</dd>
        </div>
        <div>
          <dt>리포트 반영</dt>
          <dd>생활 리듬 요약에 반영</dd>
        </div>
        <div>
          <dt>감지 시각</dt>
          <dd>{event.time}</dd>
        </div>
        <div>
          <dt>전력 변화</dt>
          <dd>{event.powerDelta}W</dd>
        </div>
      </dl>

      <div className="rawWaveform" aria-label="전력 핑거프린트 원천 파형">
        {event.waveform.map((value, index) => (
          <span
            key={`${event.id}-${index}`}
            style={
              { "--bar-height": `${Math.max(value, 8)}%` } as CSSProperties
            }
          />
        ))}
      </div>
    </motion.div>
  );
}

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { type ApplianceEvent } from "@/data/routineDataset";

type PrivacyPanelProps = {
  event?: ApplianceEvent;
};

export function PrivacyPanel({ event }: PrivacyPanelProps) {
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    setShowRawData(false);
  }, [event?.id]);

  return (
    <section className="wavePanel" aria-labelledby="privacy-title">
      <div className="sectionHeader compact">
        <div>
          <p className="eyebrow">Privacy Layer</p>
          <h2 id="privacy-title">원천 데이터 처리 과정</h2>
        </div>
        <ShieldCheck aria-hidden="true" size={20} />
      </div>

      <div className="waveBody">
        <AnimatePresence mode="wait">
          {event ? (
            <motion.div
              key="protected"
              className="privacyContent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <button
                className="privacyIcon privacyLockButton"
                type="button"
                aria-label={showRawData ? "원천 데이터 숨기기" : "원천 데이터 보기"}
                aria-pressed={showRawData}
                onClick={() => setShowRawData((current) => !current)}
              >
                <LockKeyhole aria-hidden="true" size={28} />
              </button>
              <div className="privacyCopy">
                <strong>기본 화면과 AI 입력에는 요약값만 전달됩니다.</strong>
                <p>
                  자물쇠를 누르면 프로토타입 검증을 위해 이번 상호작용의
                  원천 데이터와 요약 처리 단계를 확인할 수 있습니다.
                </p>
              </div>

              <div className="processingSteps" aria-label="원천 데이터 처리 단계">
                <span>원천 신호</span>
                <span>로컬 요약</span>
                <span>AI 입력</span>
              </div>

              <AnimatePresence initial={false}>
                {showRawData ? (
                  <motion.div
                    className="rawDataPanel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <dl>
                      <div>
                        <dt>제품</dt>
                        <dd>{event.applianceLabel}</dd>
                      </div>
                      <div>
                        <dt>감지 시각</dt>
                        <dd>{event.time}</dd>
                      </div>
                      <div>
                        <dt>기준 시각</dt>
                        <dd>{event.baselineTime}</dd>
                      </div>
                      <div>
                        <dt>전력 변화</dt>
                        <dd>{event.powerDelta}W</dd>
                      </div>
                      <div>
                        <dt>지속 시간</dt>
                        <dd>{event.duration}분</dd>
                      </div>
                    </dl>

                    <div className="rawWaveform" aria-label="전력 핑거프린트 원천 파형">
                      {event.waveform.map((value, index) => (
                        <span
                          key={`${event.id}-${index}`}
                          style={{ "--bar-height": `${Math.max(value, 8)}%` } as CSSProperties}
                        />
                      ))}
                    </div>

                    <p>
                      이 값은 프로토타입 설명용으로만 펼쳐 보여주며, 보호자 리포트와
                      AI API에는 상태, 변화 정도, 권장 조치 요약만 전달됩니다.
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="emptyWave privacyEmpty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LockKeyhole aria-hidden="true" size={22} />
              <span>생활 신호는 익명 요약으로만 처리됩니다.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

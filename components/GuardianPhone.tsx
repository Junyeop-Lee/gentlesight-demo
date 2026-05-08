import { useEffect, useState } from "react";
import { BellRing, LockKeyhole, Phone, ShieldCheck } from "lucide-react";
import {
  type ADLState,
  type AnomalyResult,
  type GuardianReport
} from "@/data/routineDataset";

type GuardianPhoneProps = {
  report: GuardianReport;
  adlState: ADLState;
  anomaly: AnomalyResult;
  hasSignal: boolean;
};

export function GuardianPhone({
  report,
  adlState,
  anomaly,
  hasSignal
}: GuardianPhoneProps) {
  const typedMessage = useTypedMessage(report.message);

  return (
    <section className="phonePanel" aria-labelledby="phone-title">
      <div className="phoneFrame">
        <div className="phoneTopBar">
          <span>GentleSight App</span>
          <ShieldCheck aria-hidden="true" size={18} />
        </div>

        <div className="phoneStatus">
          <div>
            <p className="eyebrow">Live Report</p>
            <h2 id="phone-title">{report.title}</h2>
          </div>
          <span className={`statusPill ${report.tone}`}>
            {toneLabel[report.tone]}
          </span>
        </div>

        <div className="reportBubble" aria-live="polite">
          <BellRing aria-hidden="true" size={20} />
          <p>{typedMessage}</p>
          <span className="typingCursor" aria-hidden="true" />
        </div>

        <div className="phoneMetrics">
          <div>
            <span>상태</span>
            <strong>{adlState.label}</strong>
          </div>
          <div>
            <span>주의도</span>
            <strong>{anomaly.gaugeValue}</strong>
          </div>
        </div>

        <div className="privacyFeed" aria-label="개인정보 보호 상태">
          <LockKeyhole aria-hidden="true" size={18} />
          <div>
            <strong>{hasSignal ? "익명 요약 처리 완료" : "익명 요약 대기"}</strong>
            <span>개별 기기명과 원천 신호는 표시하지 않습니다.</span>
          </div>
        </div>

        <button className="callButton" type="button">
          <Phone aria-hidden="true" size={18} />
          <span>{report.recommendedAction}</span>
        </button>

        <div className="phoneHomeIndicator" aria-hidden="true" />
      </div>
    </section>
  );
}

const toneLabel: Record<GuardianReport["tone"], string> = {
  calm: "안정",
  warm: "안부",
  alert: "확인"
};

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

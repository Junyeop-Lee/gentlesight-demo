import { useEffect, useState } from "react";
import {
  BellRing,
  BriefcaseBusiness,
  HeartHandshake,
  LockKeyhole,
  Phone,
  ShieldCheck
} from "lucide-react";
import {
  type ADLState,
  type AnomalyResult,
  type GuardianRole,
  type GuardianReport
} from "@/data/routineDataset";

type GuardianPhoneProps = {
  report: GuardianReport;
  adlState: ADLState;
  anomaly: AnomalyResult;
  hasSignal: boolean;
  role: GuardianRole | null;
  onRoleChange: (role: GuardianRole | null) => void;
};

export function GuardianPhone({
  report,
  adlState,
  anomaly,
  hasSignal,
  role,
  onRoleChange
}: GuardianPhoneProps) {
  const typedMessage = useTypedMessage(report.message);
  const [showReason, setShowReason] = useState(false);

  useEffect(() => {
    setShowReason(false);
  }, [anomaly.severity, role]);

  return (
    <section className="phonePanel" aria-labelledby="phone-title">
      <div className="phoneFrame">
        <div className="phoneTopBar">
          <span>GentleSight App</span>
          {role ? (
            <button
              className="roleChangeButton"
              type="button"
              onClick={() => onRoleChange(null)}
            >
              역할 변경
            </button>
          ) : (
            <ShieldCheck aria-hidden="true" size={18} />
          )}
        </div>

        {!role ? (
          <RoleSelection onSelect={onRoleChange} />
        ) : (
          <div className="phoneContent">
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
                <strong>{anomaly.statusLabel}</strong>
              </div>
              <div>
                <span>{role === "socialWorker" ? "우선도" : "변화도"}</span>
                <strong>{anomaly.gaugeValue}</strong>
              </div>
            </div>

            {anomaly.severity === "caution" ? (
              <div className="checkReasonWrap">
                <button
                  className="reasonToggleButton"
                  type="button"
                  aria-expanded={showReason}
                  onClick={() => setShowReason((shown) => !shown)}
                >
                  왜 확인이 필요한가요?
                </button>
              </div>
            ) : null}

            {role === "socialWorker" ? (
              <div className="caseSummary">
                <span>케이스 요약</span>
                <strong>{adlState.label}</strong>
                <p>{anomaly.currentText}</p>
              </div>
            ) : null}

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

            {showReason ? (
              <div className="checkReasonPopover" role="dialog" aria-label="확인 필요 사유">
                <button
                  className="reasonCloseButton"
                  type="button"
                  aria-label="확인 필요 사유 닫기"
                  onClick={() => setShowReason(false)}
                >
                  닫기
                </button>
                <strong>
                  {role === "socialWorker"
                    ? "개인 기준선 대비 확인이 필요합니다."
                    : "평소와 달라진 아침 리듬 때문입니다."}
                </strong>
                <p>{anomaly.reasonSummary}</p>
                <p>
                  {role === "socialWorker"
                    ? "기기명이나 원천 신호를 노출하지 않고, 생활 리듬 변화만 케이스 확인 근거로 사용합니다."
                    : "개별 기기 사용 여부가 아니라 생활 리듬 변화만 보고 가볍게 안부를 확인하도록 권합니다."}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function RoleSelection({
  onSelect
}: {
  onSelect: (role: GuardianRole) => void;
}) {
  return (
    <div className="roleSelection" aria-labelledby="phone-title">
      <p className="eyebrow">View Mode</p>
      <h2 id="phone-title">어떤 관점으로 확인하시나요?</h2>
      <p>
        같은 생활 리듬 요약을 가족 보호자에게는 따뜻한 안부 언어로,
        사회복지사에게는 케이스 확인 언어로 보여줍니다.
      </p>

      <button type="button" onClick={() => onSelect("family")}>
        <HeartHandshake aria-hidden="true" size={22} />
        <span>
          <strong>가족 보호자</strong>
          <small>전화하기, 가족 메모 중심</small>
        </span>
      </button>
      <button type="button" onClick={() => onSelect("socialWorker")}>
        <BriefcaseBusiness aria-hidden="true" size={22} />
        <span>
          <strong>사회복지사</strong>
          <small>케이스 메모, 방문 우선순위 중심</small>
        </span>
      </button>
    </div>
  );
}

const toneLabel: Record<GuardianReport["tone"], string> = {
  calm: "안정",
  warm: "관찰",
  alert: "확인 필요"
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

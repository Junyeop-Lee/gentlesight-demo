"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  RefreshCcw,
  ShieldCheck
} from "lucide-react";
import { useState, type ChangeEvent } from "react";
import styles from "./page.module.css";

type Section = {
  id: string;
  area: string;
  name: string;
  remaining: number;
  tone: "emerald" | "blue" | "coral" | "amber" | "violet" | "slate";
};

type Step = "seat" | "price" | "delivery";

type Phase =
  | "idle"
  | "section"
  | "assigned"
  | "shortage"
  | "confirmed"
  | "price"
  | "delivery";

type PriceRow = {
  group: string;
  label: string;
  price: number;
  selectable?: boolean;
};

const initialSections: Section[] = [
  {
    id: "table-demo",
    area: "T1",
    name: "데모 테이블석",
    remaining: 0,
    tone: "slate"
  },
  {
    id: "red-first",
    area: "R1",
    name: "1루 레드석",
    remaining: 2,
    tone: "coral"
  },
  {
    id: "navy-first",
    area: "N1",
    name: "1루 네이비석",
    remaining: 0,
    tone: "blue"
  },
  {
    id: "orange-first",
    area: "O1",
    name: "1루 오렌지석",
    remaining: 3,
    tone: "amber"
  },
  {
    id: "central-navy",
    area: "CN",
    name: "중앙 네이비석",
    remaining: 1,
    tone: "violet"
  },
  {
    id: "outfield",
    area: "OF",
    name: "외야 응원석",
    remaining: 4,
    tone: "emerald"
  }
];

const seatsBySection: Record<string, string[]> = {
  "red-first": ["R1-118-09", "R1-118-10"],
  "orange-first": ["O1-205-14", "O1-205-15", "O1-205-16"],
  "central-navy": ["CN-315-06"],
  outfield: ["OF-421-22", "OF-421-23", "OF-421-24", "OF-421-25"]
};

const priceRows: PriceRow[] = [
  { group: "기본가", label: "성인", price: 11000, selectable: true },
  { group: "신용카드할인", label: "KB국민카드 2026월 할인(성인)", price: 8974 },
  { group: "신용카드할인", label: "문화누리카드(성인)40%", price: 6600 },
  { group: "신용카드할인", label: "문화누리카드(청소년)40%", price: 5400 },
  { group: "신용카드할인", label: "문화누리카드(어린이)40%", price: 3300 },
  { group: "기본할인", label: "청소년", price: 9000 },
  { group: "기본할인", label: "군인", price: 9000 },
  { group: "기본할인", label: "어린이", price: 5500 },
  { group: "기본할인", label: "장애인", price: 5500 }
];

const basePrice = 11000;
const feePerTicket = 1000;

function findFirstAvailable(sections: Section[], ticketCount: number) {
  return sections.find((section) => section.remaining >= ticketCount) ?? null;
}

function formatWon(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export default function TicketTrainingPage() {
  const [sections, setSections] = useState(initialSections);
  const [currentStep, setCurrentStep] = useState<Step>("seat");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [assignedSeats, setAssignedSeats] = useState<string[]>([]);
  const [ticketCount, setTicketCount] = useState(2);
  const [showShortageModal, setShowShortageModal] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [logs, setLogs] = useState<string[]>([
    "대기 중: 로컬 더미 예매 화면이 준비되었습니다."
  ]);

  const selectedSection =
    sections.find((section) => section.id === selectedSectionId) ?? null;
  const visibleAssignedSeats = assignedSeats.slice(0, ticketCount);
  const selectedSeatCount = Math.min(visibleAssignedSeats.length, ticketCount);
  const ticketAmount = basePrice * ticketCount;
  const feeAmount = feePerTicket * ticketCount;
  const totalAmount = ticketAmount + feeAmount;

  const pushLog = (message: string) => {
    setLogs((current) => [message, ...current].slice(0, 7));
  };

  const openShortageModal = () => {
    setShowShortageModal(true);
    setPhase("shortage");
    pushLog("자동배정 실패: 선택매수만큼 배정 가능한 더미 좌석이 없습니다.");
  };

  const selectSection = (section: Section) => {
    if (section.remaining === 0) {
      pushLog(`${section.name}: 잔여석이 없어 선택하지 않았습니다.`);
      return;
    }

    setSelectedSectionId(section.id);
    setAssignedSeats([]);
    setPhase("section");
    pushLog(`${section.name}: 구역을 선택했습니다.`);
  };

  const autoAssign = () => {
    const target = selectedSection ?? findFirstAvailable(sections, ticketCount);

    if (!target || target.remaining < ticketCount) {
      openShortageModal();
      return;
    }

    const seats = seatsBySection[target.id] ?? [`${target.area}-101-01`];
    setSelectedSectionId(target.id);
    setAssignedSeats(seats.slice(0, ticketCount));
    setPhase("assigned");
    pushLog(`${target.name}: ${ticketCount}석 자동배정이 완료되었습니다.`);
  };

  const confirmSeat = () => {
    if (!selectedSection || assignedSeats.length < ticketCount) {
      openShortageModal();
      return;
    }

    setCurrentStep("price");
    setPhase("price");
    pushLog("좌석선택 완료: 가격/할인선택 화면으로 이동했습니다.");
  };

  const goToDelivery = () => {
    if (assignedSeats.length < ticketCount) {
      openShortageModal();
      return;
    }

    setCurrentStep("delivery");
    setPhase("delivery");
    pushLog("다음단계 완료: 배송선택/주문자확인 더미 단계로 이동했습니다.");
  };

  const handleTicketCountChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCount = Number(event.target.value);
    setTicketCount(nextCount);
    pushLog(`가격/할인선택: 성인 ${nextCount}매로 변경했습니다.`);
  };

  const resetDemo = () => {
    setSections(initialSections);
    setCurrentStep("seat");
    setSelectedSectionId(null);
    setAssignedSeats([]);
    setTicketCount(2);
    setShowShortageModal(false);
    setPhase("idle");
    setLogs(["초기화 완료: 훈련 화면을 다시 시작할 수 있습니다."]);
  };

  return (
    <main
      id="main-content"
      className={styles.trainingShell}
      data-training-page="ticket-macro-training"
    >
      <section className={styles.headerBand}>
        <div>
          <p className={styles.kicker}>Local Training Popup</p>
          <h1>자동배정 클릭 자동화 실습</h1>
        </div>
        <div className={styles.guardBadge}>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>localhost 전용</span>
        </div>
      </section>

      <section className={styles.popupFrame} aria-label="교육용 예매 팝업">
        <nav className={styles.stepTabs} aria-label="예매 단계">
          <span className={currentStep === "seat" ? styles.activeStep : ""}>
            좌석선택
          </span>
          <span className={currentStep === "price" ? styles.activeStep : ""}>
            가격/할인선택
          </span>
          <span className={currentStep === "delivery" ? styles.activeStep : ""}>
            배송선택/주문자확인
          </span>
        </nav>

        {currentStep === "seat" ? (
          <div className={styles.seatStage}>
            <div className={styles.stadiumPanel}>
              <div className={styles.scoreHeader}>
                <div>
                  <strong>Training Match</strong>
                  <span>2026.05.17 14:00</span>
                </div>
                <span className={styles.demoMark}>DEMO</span>
              </div>

              <div className={styles.fieldMap} aria-hidden="true">
                <div className={styles.outfield}>OUTFIELD</div>
                <div className={styles.diamond}>
                  <span />
                  <strong>FIELD</strong>
                </div>
                <div className={styles.sectionRing}>
                  {sections.map((section) => (
                    <i
                      key={section.id}
                      className={`${styles.mapBlock} ${styles[section.tone]}`}
                    >
                      {section.area}
                    </i>
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.controlPanel}>
              <div className={styles.panelHeader}>
                <span>좌석 등급</span>
                <span>잔여</span>
              </div>

              <div className={styles.sectionList}>
                {sections.map((section) => {
                  const isSelected = selectedSectionId === section.id;
                  const isDisabled = section.remaining === 0;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      className={`${styles.sectionButton} ${
                        isSelected ? styles.selected : ""
                      }`}
                      data-training-id={`section-${section.id}`}
                      data-training-section-name={section.name}
                      data-training-available={section.remaining > 0}
                      data-training-remaining={section.remaining}
                      disabled={isDisabled}
                      onClick={() => selectSection(section)}
                    >
                      <span>
                        <i className={`${styles.dot} ${styles[section.tone]}`} />
                        {section.name}
                      </span>
                      <strong>{section.remaining}석</strong>
                    </button>
                  );
                })}
              </div>

              <div className={styles.seatStatus} data-training-id="selected-seat">
                <span>배정 좌석</span>
                <strong>
                  {visibleAssignedSeats.length
                    ? visibleAssignedSeats.join(", ")
                    : "미배정"}
                </strong>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.autoButton}
                  data-training-id="auto-assign"
                  onClick={autoAssign}
                >
                  <MousePointerClick size={18} aria-hidden="true" />
                  자동배정
                </button>
                <button
                  type="button"
                  className={styles.confirmButton}
                  data-training-id="seat-confirm"
                  onClick={confirmSeat}
                >
                  <CheckCircle2 size={18} aria-hidden="true" />
                  좌석선택
                </button>
                <button
                  type="button"
                  className={styles.resetButton}
                  data-training-id="reset-demo"
                  onClick={resetDemo}
                  aria-label="훈련 화면 초기화"
                >
                  <RefreshCcw size={18} aria-hidden="true" />
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <div className={styles.priceStage}>
            <section className={styles.pricePanel} aria-label="가격/할인선택">
              <div className={styles.priceTitle}>
                <span>가격</span>
                <strong>{selectedSection?.name ?? "자동배정 구역"}</strong>
              </div>

              <div className={styles.priceTable}>
                {priceRows.map((row, index) => (
                  <div
                    key={`${row.group}-${row.label}`}
                    className={styles.priceRow}
                    data-training-price-row={row.label}
                  >
                    <span className={styles.priceGroup}>
                      {index === 0 || priceRows[index - 1].group !== row.group
                        ? row.group
                        : ""}
                    </span>
                    <span className={styles.priceName}>{row.label}</span>
                    <strong>{formatWon(row.price)}원</strong>
                    {row.selectable ? (
                      <select
                        aria-label={`${row.label} 매수`}
                        data-training-id="price-basic-quantity"
                        value={ticketCount}
                        onChange={handleTicketCountChange}
                      >
                        {[0, 1, 2, 3, 4].map((count) => (
                          <option key={count} value={count}>
                            {count}매
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select aria-label={`${row.label} 매수`} value={0} disabled>
                        <option>0매</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.couponPanel}>
                <div>
                  <strong>쿠폰할인</strong>
                  <span>중복사용불가</span>
                </div>
                <button type="button">나의쿠폰 모두보기</button>
                <p>해당 상품에 사용 가능한 쿠폰이 없습니다.</p>
              </div>
            </section>

            <aside className={styles.summaryPanel}>
              <div className={styles.matchSummary}>
                <strong>Training Match</strong>
                <span>2026.05.17 ~ 2026.05.17</span>
                <span>관람시간: -</span>
              </div>

              <div className={styles.summaryTable}>
                <span>일시</span>
                <strong>2026년 5월 17일(일) 14:00</strong>
                <span>선택좌석</span>
                <strong data-training-id="summary-seat-count">
                  {selectedSeatCount}석
                </strong>
                <span>좌석</span>
                <strong>{visibleAssignedSeats.join(", ") || "자동배정"}</strong>
                <span>티켓금액</span>
                <strong>{formatWon(ticketAmount)}원</strong>
                <span>수수료</span>
                <strong>{formatWon(feeAmount)}원</strong>
                <span>배송료</span>
                <strong>-</strong>
                <span>취소기한</span>
                <strong>2026년 5월 17일(일) 10:00</strong>
              </div>

              <div className={styles.totalBox} data-training-id="summary-total">
                <span>총 결제금액</span>
                <strong>{formatWon(totalAmount)}원</strong>
              </div>

              <div className={styles.summaryActions}>
                <button
                  type="button"
                  data-training-id="back-seat"
                  onClick={() => setCurrentStep("seat")}
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                  이전단계
                </button>
                <button
                  type="button"
                  data-training-id="next-price"
                  onClick={goToDelivery}
                >
                  다음단계
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </aside>
          </div>
        )}

        {currentStep === "delivery" ? (
          <div className={styles.deliveryPanel} data-training-id="delivery-panel">
            <CheckCircle2 size={34} aria-hidden="true" />
            <div>
              <strong>배송선택/주문자확인 더미 단계</strong>
              <span>교육용 클릭 흐름이 여기까지 완료되었습니다.</span>
            </div>
          </div>
        ) : null}

        {showShortageModal ? (
          <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label="자동배정 실패 안내"
            data-training-id="shortage-modal"
          >
            <div className={styles.alertModal}>
              <div className={styles.alertCopy}>
                <AlertCircle size={20} aria-hidden="true" />
                <p>현재 선택매수만큼 자동배정가능한 좌석이 없습니다.</p>
              </div>
              <button
                type="button"
                data-training-id="close-modal"
                onClick={() => setShowShortageModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className={styles.statusBand} aria-live="polite">
        <div className={styles.phasePanel}>
          <span>상태</span>
          <strong>{phaseLabel[phase]}</strong>
        </div>
        <ol className={styles.logList}>
          {logs.map((log, index) => (
            <li key={`${log}-${index}`}>{log}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}

const phaseLabel: Record<Phase, string> = {
  idle: "대기",
  section: "구역 선택",
  assigned: "자동배정 완료",
  shortage: "자동배정 실패",
  confirmed: "좌석선택 완료",
  price: "가격/할인선택",
  delivery: "다음단계 완료"
};

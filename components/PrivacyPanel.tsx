import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { type ApplianceEvent } from "@/data/routineDataset";
import {
  copy,
  getApplianceLabel,
  getPrivacySafeSignalLabel,
  type Language
} from "@/lib/i18n";

type PrivacyPanelProps = {
  events: ApplianceEvent[];
  language: Language;
};

export function PrivacyPanel({ events, language }: PrivacyPanelProps) {
  const [unlockStep, setUnlockStep] = useState<"locked" | "confirm" | "raw">(
    "locked"
  );
  const hasEvents = events.length > 0;
  const t = copy[language];

  useEffect(() => {
    setUnlockStep("locked");
  }, [events.length]);

  return (
    <section className="wavePanel" aria-labelledby="privacy-title">
      <div className="sectionHeader compact">
        <div>
          <p className="eyebrow">{t.privacyLayer}</p>
          <h2 id="privacy-title">{t.privacySummary}</h2>
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
              <strong>{t.privacyPromiseTitle}</strong>
              <p>{t.privacyPromiseCopy}</p>
            </div>

            <div className="privacyPromiseGrid">
              <span>{t.noCamera}</span>
              <span>{t.rawHidden}</span>
              <span>{t.rhythmSummary}</span>
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
                  {hasEvents ? t.viewEducationalRaw : t.viewAfterDemo}
                </span>
              </button>
            ) : null}

            {unlockStep === "confirm" ? (
              <div className="privacyConfirm">
                <strong>{t.rawConfirmTitle}</strong>
                <p>{t.rawConfirmCopy}</p>
                <button type="button" onClick={() => setUnlockStep("raw")}>
                  {t.understood}
                </button>
              </div>
            ) : null}

            {unlockStep === "raw" ? (
              <>
                <div className="processingSteps" aria-label={t.rawProcessLabel}>
                  <span>{t.rawSignal}</span>
                  <span>{t.anonymize}</span>
                  <span>{t.reportApplied}</span>
                </div>

                <div className="processingLogList">
                  {events.map((event) => (
                    <ProcessingLog
                      event={event}
                      key={event.id}
                      language={language}
                    />
                  ))}
                </div>

                <p className="privacyFootnote">{t.privacyFootnote}</p>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function ProcessingLog({
  event,
  language
}: {
  event: ApplianceEvent;
  language: Language;
}) {
  const t = copy[language];
  const applianceLabel = getApplianceLabel(event.appliance, language);

  return (
    <motion.div
      className="rawDataPanel processingLog"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <dl>
        <div>
          <dt>{t.rawSignal}</dt>
          <dd>
            {language === "ko"
              ? `${applianceLabel} ${t.detectedInputSuffix}`
              : `${applianceLabel} ${t.detectedInputSuffix}`}
          </dd>
        </div>
        <div>
          <dt>{t.anonymize}</dt>
          <dd>{getPrivacySafeSignalLabel(event, language)}</dd>
        </div>
        <div>
          <dt>{t.reportApplied}</dt>
          <dd>{t.reportAppliedCopy}</dd>
        </div>
        <div>
          <dt>{t.detectedTime}</dt>
          <dd>{event.time}</dd>
        </div>
        <div>
          <dt>{t.powerChange}</dt>
          <dd>{event.powerDelta}W</dd>
        </div>
      </dl>

      <div className="rawWaveform" aria-label={t.rawWaveformLabel}>
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

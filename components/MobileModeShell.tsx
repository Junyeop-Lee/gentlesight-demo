import type { ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  HeartPulse,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import type { ActionPanel } from "@/components/GlobalActionBar";
import type { Language } from "@/lib/i18n";

export type MobileInfoMode = "guardian" | ActionPanel;

type MobileModeShellProps = {
  activeMode: MobileInfoMode;
  children: ReactNode;
  language: Language;
  onBack: () => void;
  onModeChange: (mode: MobileInfoMode) => void;
};

const modeCopy = {
  ko: {
    back: "Interaction으로 돌아가기",
    title: "GentleSight App",
    guardian: "Guardian",
    status: "상태",
    comparison: "기준선",
    privacy: "프라이버시"
  },
  en: {
    back: "Back to Interaction",
    title: "GentleSight App",
    guardian: "Guardian",
    status: "Status",
    comparison: "Baseline",
    privacy: "Privacy"
  }
} as const;

const modes = [
  { id: "guardian", Icon: Smartphone },
  { id: "status", Icon: HeartPulse },
  { id: "comparison", Icon: BarChart3 },
  { id: "privacy", Icon: ShieldCheck }
] as const;

export function MobileModeShell({
  activeMode,
  children,
  language,
  onBack,
  onModeChange
}: MobileModeShellProps) {
  const labels = modeCopy[language];

  return (
    <section
      className="mobileModeOverlay"
      aria-labelledby="mobile-mode-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="mobileModeSurface">
        <header className="mobileModeHeader">
          <button className="mobileBackButton" type="button" onClick={onBack}>
            <ArrowLeft aria-hidden="true" size={18} />
            <span>{labels.back}</span>
          </button>
          <h2 id="mobile-mode-title">{labels.title}</h2>
          <nav className="mobileModeTabs" aria-label={labels.title}>
            {modes.map(({ id, Icon }) => (
              <button
                className={activeMode === id ? "selected" : ""}
                key={id}
                type="button"
                aria-pressed={activeMode === id}
                onClick={() => onModeChange(id)}
              >
                <Icon aria-hidden="true" size={17} />
                <span>{labels[id]}</span>
              </button>
            ))}
          </nav>
        </header>

        <div className="mobileModeContent">{children}</div>
      </div>
    </section>
  );
}

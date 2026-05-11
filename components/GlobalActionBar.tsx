import { BarChart3, HeartPulse, ShieldCheck } from "lucide-react";
import { copy, type Language } from "@/lib/i18n";

export type ActionPanel = "status" | "comparison" | "privacy";

type GlobalActionBarProps = {
  activePanel: ActionPanel | null;
  language: Language;
  onSelectPanel: (panel: ActionPanel) => void;
};

const actions = [
  { id: "status", labelKey: "statusView", Icon: HeartPulse },
  { id: "comparison", labelKey: "comparison", Icon: BarChart3 },
  { id: "privacy", labelKey: "privacySummary", Icon: ShieldCheck }
] as const;

export function GlobalActionBar({
  activePanel,
  language,
  onSelectPanel
}: GlobalActionBarProps) {
  const t = copy[language];

  return (
    <nav className="globalActionBar" aria-label={t.actionBarLabel}>
      {actions.map(({ id, labelKey, Icon }) => (
        <button
          className={activePanel === id ? "selected" : ""}
          key={id}
          type="button"
          aria-pressed={activePanel === id}
          onClick={() => onSelectPanel(id)}
        >
          <Icon aria-hidden="true" size={18} />
          <span>{t[labelKey]}</span>
        </button>
      ))}
    </nav>
  );
}

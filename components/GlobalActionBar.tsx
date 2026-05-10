import { BarChart3, HeartPulse, ShieldCheck } from "lucide-react";

export type ActionPanel = "status" | "comparison" | "privacy";

type GlobalActionBarProps = {
  activePanel: ActionPanel | null;
  onSelectPanel: (panel: ActionPanel) => void;
};

const actions = [
  { id: "status", label: "상태 보기", Icon: HeartPulse },
  { id: "comparison", label: "평소와 비교", Icon: BarChart3 },
  { id: "privacy", label: "프라이버시 요약", Icon: ShieldCheck }
] as const;

export function GlobalActionBar({
  activePanel,
  onSelectPanel
}: GlobalActionBarProps) {
  return (
    <nav className="globalActionBar" aria-label="GentleSight 주요 정보">
      {actions.map(({ id, label, Icon }) => (
        <button
          className={activePanel === id ? "selected" : ""}
          key={id}
          type="button"
          aria-pressed={activePanel === id}
          onClick={() => onSelectPanel(id)}
        >
          <Icon aria-hidden="true" size={18} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

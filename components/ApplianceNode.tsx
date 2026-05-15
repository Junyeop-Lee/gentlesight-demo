import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import {
  type ApplianceId,
  type ApplianceMeta
} from "@/data/routineDataset";

type ApplianceNodeProps = {
  appliance: ApplianceMeta;
  ariaLabel: string;
  disabled: boolean;
  label: string;
  onClick: (applianceId: ApplianceId) => void;
};

export function ApplianceNode({
  appliance,
  ariaLabel,
  disabled,
  label,
  onClick
}: ApplianceNodeProps) {
  return (
    <motion.button
      className="applianceNode"
      data-appliance-id={appliance.id}
      style={{
        left: `var(--appliance-x, ${appliance.x}%)`,
        top: `var(--appliance-y, ${appliance.y}%)`,
        "--appliance-color": "#2f9d84"
      } as CSSProperties}
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onClick(appliance.id)}
      whileHover={disabled ? undefined : { y: -4, scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
    >
      <span className="applianceHalo" aria-hidden="true" />
      <span className="applianceIcon">
        <Activity aria-hidden="true" size={22} strokeWidth={2.2} />
      </span>
      <span className="applianceLabel">{label}</span>
    </motion.button>
  );
}

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import {
  type ApplianceId,
  type ApplianceMeta
} from "@/data/routineDataset";

type ApplianceNodeProps = {
  appliance: ApplianceMeta;
  disabled: boolean;
  onClick: (applianceId: ApplianceId) => void;
};

export function ApplianceNode({
  appliance,
  disabled,
  onClick
}: ApplianceNodeProps) {
  return (
    <motion.button
      className="applianceNode"
      style={{
        left: `${appliance.x}%`,
        top: `${appliance.y}%`,
        "--appliance-color": "#2f9d84"
      } as CSSProperties}
      type="button"
      aria-label={`${appliance.label} 상호작용 입력`}
      disabled={disabled}
      onClick={() => onClick(appliance.id)}
      whileHover={disabled ? undefined : { y: -4, scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
    >
      <span className="applianceHalo" aria-hidden="true" />
      <span className="applianceIcon">
        <Activity aria-hidden="true" size={22} strokeWidth={2.2} />
      </span>
      <span className="applianceLabel">{appliance.label}</span>
    </motion.button>
  );
}

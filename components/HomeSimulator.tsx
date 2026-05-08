import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  type ApplianceId,
  type ApplianceMeta
} from "@/data/routineDataset";
import { ApplianceNode } from "@/components/ApplianceNode";

type HomeSimulatorProps = {
  appliances: ApplianceMeta[];
  onApplianceClick: (applianceId: ApplianceId) => void;
  disabled: boolean;
  children?: ReactNode;
};

export function HomeSimulator({
  appliances,
  onApplianceClick,
  disabled,
  children
}: HomeSimulatorProps) {
  return (
    <section className="homePanel homeExperience" aria-labelledby="home-title">
      <div className="homeSceneWrapper">
        <motion.img
          className="homeSceneImage"
          src="/background.jpg"
          alt=""
          aria-hidden="true"
          width={2600}
          height={1698}
          fetchPriority="high"
          decoding="async"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
        <div className="applianceLayer">
        {appliances.map((appliance) => (
          <ApplianceNode
            key={appliance.id}
            appliance={appliance}
            disabled={disabled}
            onClick={onApplianceClick}
          />
        ))}
        </div>
      </div>

      {children}
    </section>
  );
}

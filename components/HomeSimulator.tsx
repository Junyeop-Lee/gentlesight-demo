import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import {
  type ApplianceId,
  type ApplianceMeta
} from "@/data/routineDataset";
import {
  getApplianceInputLabel,
  getApplianceLabel,
  type Language
} from "@/lib/i18n";
import { ApplianceNode } from "@/components/ApplianceNode";

type HomeSimulatorProps = {
  appliances: ApplianceMeta[];
  onApplianceClick: (applianceId: ApplianceId) => void;
  disabled: boolean;
  lightingLevel: number;
  language: Language;
  children?: ReactNode;
};

export function HomeSimulator({
  appliances,
  onApplianceClick,
  disabled,
  lightingLevel,
  language,
  children
}: HomeSimulatorProps) {
  return (
    <section
      className="homePanel homeExperience"
      aria-labelledby="home-title"
      style={
        {
          "--home-lighting": lightingLevel,
          "--home-shade-opacity": Math.max(0, (1 - lightingLevel) * 0.58)
        } as CSSProperties
      }
    >
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
        <div className="homeSceneShade" aria-hidden="true" />
        <div className="applianceLayer">
        {appliances.map((appliance) => (
          <ApplianceNode
            key={appliance.id}
            appliance={appliance}
            ariaLabel={getApplianceInputLabel(appliance.id, language)}
            disabled={disabled}
            label={getApplianceLabel(appliance.id, language)}
            onClick={onApplianceClick}
          />
        ))}
        </div>
      </div>

      {children}
    </section>
  );
}

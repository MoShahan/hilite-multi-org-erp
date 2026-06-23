import { ModuleDisabledCard } from "@/components/ModuleDisabledCard";
import { NO_FEATURES_COPY } from "@/constants/orgModules";

export const HomePage = () => {
  return (
    <ModuleDisabledCard
      title={NO_FEATURES_COPY.title}
      description={NO_FEATURES_COPY.description}
    />
  );
};

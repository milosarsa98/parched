import { IHydrationConfig } from "./types/hydration";
import { exertionValues } from "./config/activityConfig";
import { biomeMultipliers } from "./config/biomeHydrationConfig";
import { daytimeMultiplier, dimensionMultipliers, skyExposureMultiplier, weatherMultiplier } from "./config/environmentConfig";
import { itemValues } from "./config/itemHydrationConfig";

export const HYDRATION_CONFIG: IHydrationConfig = {
  baseDrainRate: 0.01, // Base hydration drain rate per tick
  tickInterval: 20, // Number of ticks between hydration updates
  uiTickInterval: 5, // Number of ticks between hydration UI refreshes
  punishTickInterval: 40, // Number of ticks between hydration consequences are applied
  maxHydration: 100, // Maximum hydration level
  criticalThreshold: 20, // Hydration level considered critical
  exertionValues: exertionValues,
  daytimeMultiplier: daytimeMultiplier,
  weatherMultiplier: weatherMultiplier,
  skyExposureMultiplier: skyExposureMultiplier,
  itemValues: itemValues,
  biomeMultipliers: biomeMultipliers,
  dimensionMultipliers: dimensionMultipliers,
};

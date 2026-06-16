import { dryBiomes } from "./biomeHydrationConfig";

export const dimensionMultipliers = {
  "minecraft:overworld": 1.0,
  "minecraft:nether": 2.0,
  "minecraft:end": 1.5,
};

export const daytimeMultiplier = {
  midnight: 0.85,
  noon: 1.3,
};

export const weatherMultiplier = {
  rain: 0.75,
  thunder: 0.65,
  dryBiomes: dryBiomes,
};

export const skyExposureMultiplier = {
  sheltered: 0.8,
  exposed: 1.25,
};

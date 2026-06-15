import { Player } from "@minecraft/server";

import { IHydrationConfig, IHydrationModifier } from "../types/hydration";

/**
 * Enmvioronment modifier should factor in not just the biome and the dimension
 * It should also count in the direct exposure to the sun, exposure in the shade and exposure during the night
 */
export class EnvironmentModifier implements IHydrationModifier {
  private readonly config: IHydrationConfig;

  constructor(config: IHydrationConfig) {
    this.config = config;
  }

  public calculateMultiplier(player: Player): number {
    let multiplier = 1;

    const dimensionId = player.dimension.id;
    const dimensionMultiplier = this.config.dimensionMultipliers[dimensionId];

    if (dimensionMultiplier !== undefined) {
      multiplier *= dimensionMultiplier;
    }

    const biomeMultiplier = this.getBiomeBase(player);

    if (biomeMultiplier !== undefined) {
      multiplier *= biomeMultiplier;
    }

    const inWater = player.isInWater;

    return multiplier * (inWater ? 0.3 : 1);
  }

  private getBiomeBase(player: Player): number {
    const biomeId = this.getBiomeId(player);

    let multiplier = this.config.biomeMultipliers[biomeId];

    return multiplier;
  }

  private getBiomeId(player: Player): string {
    const biomeId = player.dimension.getBiome(player.location).id;

    return biomeId;
  }
}

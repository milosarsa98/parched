import { Player, WeatherType, world } from "@minecraft/server";

import { IHydrationConfig, IHydrationModifier } from "../types/hydration";

/**
 * Environment modifier should factor in not just the biome and the dimension
 * It should also count in the direct exposure to the sun, exposure in the shade and exposure during the night
 */
export class EnvironmentModifier implements IHydrationModifier {
  private readonly config: IHydrationConfig;
  private readonly dryBiomes: Set<string>;
  private currentWeather = WeatherType.Clear;

  constructor(config: IHydrationConfig) {
    this.config = config;
    this.dryBiomes = new Set(config.weatherMultiplier.dryBiomes);

    world.afterEvents.weatherChange.subscribe((event) => {
      this.currentWeather = event.newWeather;
    });
  }

  public calculateMultiplier(player: Player): number {
    let multiplier = 1;

    const dimensionId = player.dimension.id;
    const dimensionMultiplier = this.config.dimensionMultipliers[dimensionId];

    if (dimensionMultiplier !== undefined) {
      multiplier *= dimensionMultiplier;
    }

    const biomeId = this.getBiomeId(player);
    const biomeMultiplier = this.getBiomeBase(biomeId);

    if (biomeMultiplier !== undefined) {
      multiplier *= biomeMultiplier;
    }

    multiplier *= this.getDaytimeMultiplier(dimensionId);
    multiplier *= this.getSunExposureMultiplier(player);
    multiplier *= this.getWeatherMultiplier(player, biomeId);

    const inWater = player.isInWater;

    return multiplier * (inWater ? 0.3 : 1);
  }

  private getBiomeBase(biomeId: string): number {
    return this.config.biomeMultipliers[biomeId];
  }

  private getBiomeId(player: Player): string {
    const biomeId = player.dimension.getBiome(player.location).id;

    return biomeId;
  }

  private getDaytimeMultiplier(dimensionId: string): number {
    if (dimensionId !== "minecraft:overworld") {
      return 1;
    }

    const timeOfDay = world.getTimeOfDay();
    const noonOffset = (timeOfDay - 6000) / 24000;
    const noonStrength = (Math.cos(noonOffset * Math.PI * 2) + 1) / 2;

    const multiplier =
      this.config.daytimeMultiplier.midnight +
      (this.config.daytimeMultiplier.noon - this.config.daytimeMultiplier.midnight) * noonStrength;

    return multiplier;
  }

  private getWeatherMultiplier(player: Player, biomeId: string): number {
    if (player.dimension.id !== "minecraft:overworld" || this.dryBiomes.has(biomeId) || !this.getSkyExposure(player)) {
      return 1;
    }

    if (this.currentWeather === WeatherType.Thunder) {
      return this.config.weatherMultiplier.thunder;
    }

    if (this.currentWeather === WeatherType.Rain) {
      return this.config.weatherMultiplier.rain;
    }

    return 1;
  }

  private getSunExposureMultiplier(player: Player): number {
    if (player.dimension.id !== "minecraft:overworld" || !this.isClearDaytime()) {
      return 1;
    }

    const skyLightLevel = player.dimension.getSkyLightLevel(player.getHeadLocation());
    const exposure = Math.max(0, Math.min(1, skyLightLevel / 15));

    const multiplier =
      this.config.skyExposureMultiplier.sheltered +
      (this.config.skyExposureMultiplier.exposed - this.config.skyExposureMultiplier.sheltered) * exposure;

    return multiplier;
  }

  // Used to check if the player is exposed to the open sky
  private getSkyExposure(player: Player): number {
    const headLocation = player.getHeadLocation();
    const topmostBlock = player.dimension.getTopmostBlock({ x: headLocation.x, z: headLocation.z });

    return topmostBlock === undefined || topmostBlock.y < headLocation.y ? 1 : 0;
  }

  private isClearDaytime(): boolean {
    if (this.currentWeather !== WeatherType.Clear) {
      return false;
    }

    const timeOfDay = world.getTimeOfDay();

    return timeOfDay >= 0 && timeOfDay < 12000;
  }
}

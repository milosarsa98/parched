import { Player, WeatherType, world } from "@minecraft/server";

import { IEnvironmentSnapshot, IHydrationConfig } from "../types/hydration";

/**
 * Environment modifier should factor in not just the biome and the dimension
 * It should also count in the direct exposure to the sun, exposure in the shade and exposure during the night
 */
export class EnvironmentModifier {
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
    return this.getEnvironmentSnapshot(player).finalMultiplier;
  }

  public getEnvironmentSnapshot(player: Player): IEnvironmentSnapshot {
    const dimensionId = player.dimension.id;
    const biomeId = this.getBiomeId(player);
    const isInWater = player.isInWater;
    const isOpenToSky = this.isOpenToSky(player);

    const dimensionMultiplier = this.getDimensionMultiplier(dimensionId);
    const biomeMultiplier = this.getBiomeMultiplier(biomeId);
    const daytimeMultiplier = this.getDaytimeMultiplier(dimensionId);
    const sunExposureMultiplier = this.getSunExposureMultiplier(player);
    const weatherMultiplier = this.getWeatherMultiplier(player, biomeId, isOpenToSky);
    const waterMultiplier = this.getWaterMultiplier(isInWater);

    const finalMultiplier =
      dimensionMultiplier *
      biomeMultiplier *
      daytimeMultiplier *
      sunExposureMultiplier *
      weatherMultiplier *
      waterMultiplier;

    return {
      dimensionId,
      biomeId,
      weather: this.currentWeather,
      isInWater,
      isOpenToSky,
      dimensionMultiplier,
      biomeMultiplier,
      daytimeMultiplier,
      sunExposureMultiplier,
      weatherMultiplier,
      waterMultiplier,
      finalMultiplier,
    };
  }

  private getDimensionMultiplier(dimensionId: string): number {
    const dimensionMultiplier = this.config.dimensionMultipliers[dimensionId];

    return dimensionMultiplier !== undefined ? dimensionMultiplier : 1;
  }

  private getBiomeMultiplier(biomeId: string): number {
    const biomeMultiplier = this.config.biomeMultipliers[biomeId];

    return biomeMultiplier !== undefined ? biomeMultiplier : 1;
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

  private getWeatherMultiplier(player: Player, biomeId: string, isOpenToSky: boolean): number {
    if (player.dimension.id !== "minecraft:overworld" || this.dryBiomes.has(biomeId) || !isOpenToSky) {
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

  private getWaterMultiplier(isInWater: boolean): number {
    return isInWater ? 0.3 : 1;
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

  private isOpenToSky(player: Player): boolean {
    const headLocation = player.getHeadLocation();
    const topmostBlock = player.dimension.getTopmostBlock({ x: headLocation.x, z: headLocation.z });

    return topmostBlock === undefined || topmostBlock.y < headLocation.y;
  }

  private isClearDaytime(): boolean {
    if (this.currentWeather !== WeatherType.Clear) {
      return false;
    }

    const timeOfDay = world.getTimeOfDay();

    return timeOfDay >= 0 && timeOfDay < 12000;
  }
}

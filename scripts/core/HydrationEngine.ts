import { Player } from "@minecraft/server";

import { IHydrationConfig, IPlayerStatus } from "../types/hydration";

import { ActivityModifier } from "../logic/ActivityModifier";
import { EnvironmentModifier } from "../logic/EnvironmentModifier";
import { Logger } from "../utils/Logger";
import { HydrationStatusCache } from "./HydrationStatusCache";

const PROPERTY_IDS = {
  PLAYER_HYDRATION: "parched:player_hydration",
} as const;

/**
 * HydrationEngine class responsible for managing player hydration mechanics.
 */

export class HydrationEngine {
  private readonly config: IHydrationConfig;
  private readonly environmentModifier: EnvironmentModifier;
  private readonly activityModifier: ActivityModifier;
  private readonly logger: Logger;
  private readonly statusCache: HydrationStatusCache;

  constructor(
    config: IHydrationConfig,
    environmentModifier: EnvironmentModifier,
    activityModifier: ActivityModifier,
    logger: Logger
  ) {
    this.config = config;
    this.environmentModifier = environmentModifier;
    this.activityModifier = activityModifier;
    this.logger = logger.child("HydrationEngine");
    this.statusCache = new HydrationStatusCache(config);
  }

  public processPlayerTick(player: Player): void {
    const environmentMultiplier = this.environmentModifier.calculateMultiplier(player);
    const activityDrainRate = this.activityModifier.calculateDrainRate(player);
    const totalDrainRate = this.config.baseDrainRate + activityDrainRate;

    this.logger.info(`Player: '${player.name}' DrainRate: ${totalDrainRate} Multiplier: ${environmentMultiplier} `);

    const liveRate = totalDrainRate * environmentMultiplier;
    this.modifyHydration(player, -liveRate);
  }

  public modifyHydration(player: Player, amount: number): void {
    const currentData = player.getDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION) as number | undefined;
    const currentHydration = currentData !== undefined ? currentData : this.config.maxHydration;

    const newHydration = Math.max(0, Math.min(this.config.maxHydration, currentHydration + amount));

    player.setDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION, newHydration);

    this.statusCache.remember(player.id, newHydration, amount);
  }

  public initializePlayer(player: Player): void {
    const currentData = player.getDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION);

    if (currentData !== undefined) return;

    player.setDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION, this.config.maxHydration);
    this.statusCache.remember(player.id, this.config.maxHydration);
  }

  public resetPlayer(player: Player): void {
    // Quite rudimentary for a start but it gets the job done
    player.setDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION, this.config.maxHydration);
    this.statusCache.remember(player.id, this.config.maxHydration);
  }

  public getCachedStatus(player: Player): IPlayerStatus {
    const status = this.statusCache.get(player.id);

    if (status !== undefined) {
      return status;
    }

    const currentData = player.getDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION) as number | undefined;
    const currentHydration = currentData !== undefined ? currentData : this.config.maxHydration;

    return this.statusCache.remember(player.id, currentHydration);
  }

  public cleanupPlayer(playerId: string): void {
    this.statusCache.clear(playerId);
  }
}

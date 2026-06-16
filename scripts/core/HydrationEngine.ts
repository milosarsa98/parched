import { Player } from "@minecraft/server";

import {
  IHydrationConfig,
  IHydrationDrainRateContributor,
  IHydrationModifier,
  IPlayerStatus,
} from "../types/hydration";

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
  private readonly modifiers: IHydrationModifier[];
  private readonly drainRateContributors: IHydrationDrainRateContributor[];
  private readonly logger: Logger;
  private readonly statusCache: HydrationStatusCache;

  constructor(
    config: IHydrationConfig,
    modifiers: IHydrationModifier[],
    drainRateContributors: IHydrationDrainRateContributor[],
    logger: Logger
  ) {
    this.config = config;
    this.modifiers = modifiers;
    this.drainRateContributors = drainRateContributors;
    this.logger = logger.child("HydrationEngine");
    this.statusCache = new HydrationStatusCache(config);
  }

  public processPlayerTick(player: Player): void {
    // Implementation for processing player hydration tick
    let totalMultiplier = 1.0;
    let totalDrainRate = this.config.baseDrainRate; // Start from the base drain rate

    for (const modifier of this.modifiers) {
      totalMultiplier *= modifier.calculateMultiplier(player);
    }

    for (const drainRate of this.drainRateContributors) {
      totalDrainRate += drainRate.calculateDrainRate(player);
    }

    this.logger.info(`Player: '${player.name}' DrainRate: ${totalDrainRate} Multiplier: ${totalMultiplier} `);

    const liveRate = totalDrainRate * totalMultiplier;
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

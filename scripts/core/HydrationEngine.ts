import { Player } from "@minecraft/server";

import {
  IHydrationConfig,
  IHydrationDrainRateContributor,
  IHydrationModifier,
  IPlayerStatus,
  IPunishmentApplier,
} from "../types/hydration";
import { PROPERTY_IDS } from "./properties";

import { UiRenderer } from "../utils/UiRenderer";
import { Logger } from "../utils/Logger";

/**
 * HydrationEngine class responsible for managing player hydration mechanics.
 */

export class HydrationEngine {
  private readonly config: IHydrationConfig;
  private readonly modifiers: IHydrationModifier[];
  private readonly drainRateContributors: IHydrationDrainRateContributor[];
  private readonly punisher: IPunishmentApplier;
  private readonly uiRenderer: UiRenderer;
  private readonly logger: Logger;

  constructor(
    config: IHydrationConfig,
    modifiers: IHydrationModifier[],
    drainRateContributors: IHydrationDrainRateContributor[],
    punisher: IPunishmentApplier,
    uiRenderer: UiRenderer,
    logger: Logger
  ) {
    this.config = config;
    this.modifiers = modifiers;
    this.drainRateContributors = drainRateContributors;
    this.punisher = punisher;
    this.uiRenderer = uiRenderer;
    this.logger = logger.child("HydrationEngine");
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
    // Implementation for modifying player hydration based on modifiers
    const currentData = player.getDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION) as number | undefined;
    const currentHydration = currentData !== undefined ? currentData : this.config.maxHydration;

    const newHydration = Math.max(0, Math.min(this.config.maxHydration, currentHydration + amount));

    player.setDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION, newHydration);

    this.evaluatePlayerStatus(player, newHydration, amount);
  }

  public evaluatePlayerStatus(player: Player, currentHydration: number, liveRate?: number): void {
    // Implementation for applying consequences when player hydration reaches zero

    const isCritical = currentHydration <= this.config.criticalThreshold;
    const depletionRate = liveRate !== undefined ? liveRate : this.config.baseDrainRate;

    const status: IPlayerStatus = {
      currentHydration,
      maxHydration: this.config.maxHydration,
      isCritical,
      depletionRate,
    };

    // UI updates and other status effects can be handled here
    this.uiRenderer.renderStatus(player, status);

    if (currentHydration <= 0) {
      this.punisher.applyExhaustionDebuff(player);
      this.punisher.inflictDamage(player, 2); // Inflict damage when hydration reaches zero
    } else if (isCritical) {
      this.punisher.applyExhaustionDebuff(player);
    } else {
      this.punisher.clearEffects(player);
    }
  }

  public initializePlayer(player: Player): void {
    const currentData = player.getDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION);

    if (currentData !== undefined) return;

    player.setDynamicProperty(PROPERTY_IDS.PLAYER_HYDRATION, this.config.maxHydration);
  }
}

import { world } from "@minecraft/server";
import { HydrationEngine } from "../core/HydrationEngine";
import { AbstractLoop } from "./AbstractLoop";
import { PunishmentApplier } from "../logic/PunishmentApplier";
import { IPunishmentApplier } from "../types/hydration";

export class PunishmentLoop extends AbstractLoop {
  private readonly hydrationEngine: HydrationEngine;
  private readonly punisher: IPunishmentApplier;

  constructor(hydrationEngine: HydrationEngine, punisher: IPunishmentApplier, tickInterval: number) {
    super(tickInterval);
    this.hydrationEngine = hydrationEngine;
    this.punisher = punisher;
  }

  protected onTick(): void {
    for (const player of world.getAllPlayers()) {
      const status = this.hydrationEngine.getCachedStatus(player);
      if (status === undefined) continue;

      if (status.currentHydration <= 0) {
        this.punisher.applyExhaustionDebuff(player);
        this.punisher.inflictDamage(player, 2); // Inflict damage when hydration reaches zero
      } else if (status.isCritical) {
        this.punisher.applyExhaustionDebuff(player);
      } else {
        this.punisher.clearEffects(player);
      }
    }
  }
}

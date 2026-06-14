import { Player, world } from "@minecraft/server";
import { HydrationEngine } from "../core/HydrationEngine";
import { BaseHandler } from "./BaseHandler";
import { IHydrationConfig } from "../types/hydration";

export class ItemConsumableHandler extends BaseHandler {
  private readonly config: IHydrationConfig;

  constructor(hydrationEngine: HydrationEngine, config: IHydrationConfig) {
    super(hydrationEngine);
    this.config = config;
  }

  protected registerListeners() {
    world.afterEvents.itemCompleteUse.subscribe((event) => {
      const player = event.source as Player;
      if (!player.isValid) return;

      const itemId = event.itemStack.typeId;
      const hydrationAmount = this.config.itemValues[itemId];

      if (hydrationAmount === undefined) return;

      this.hydrationEngine.modifyHydration(player, hydrationAmount);
    });
  }
}

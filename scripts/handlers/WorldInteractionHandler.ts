import { ItemStack, world } from "@minecraft/server";
import { HydrationEngine } from "../core/HydrationEngine";
import { BaseHandler } from "./BaseHandler";

/**
 * We are scrapping this as water interaction doesn't work this way
 * Leaving this here for now
 * Will refactor/remove later
 */
export class WorldInteractionHandler extends BaseHandler {
  constructor(hydrationEngine: HydrationEngine) {
    super(hydrationEngine);
  }

  protected registerListeners(): void {
    world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
      console.log("Interacted");
      const { itemStack, block, player } = event;
      if (itemStack !== undefined) return;

      if (block.typeId !== "minecraft:water") return;
      this.hydrationEngine.modifyHydration(player, 100);
    });
  }
}

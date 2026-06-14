import { ActivityTracker } from "../core/ActivityTracker";
import { HydrationEngine } from "../core/HydrationEngine";
import { BaseHandler } from "./BaseHandler";
import { Player, world } from "@minecraft/server";

export class PlayerLifecycleHandler extends BaseHandler {
  private readonly tracker: ActivityTracker;

  constructor(hydrationEngine: HydrationEngine, tracker: ActivityTracker) {
    super(hydrationEngine);
    this.tracker = tracker;
  }

  protected registerListeners(): void {
    world.afterEvents.playerSpawn.subscribe((event) => {
      this.hydrationEngine.initializePlayer(event.player);
    });

    world.afterEvents.playerLeave.subscribe((event) => {
      this.tracker.cleanupPlayer(event.playerId);
    });
  }
}

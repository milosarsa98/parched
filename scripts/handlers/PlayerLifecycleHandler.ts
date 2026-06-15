import { ActivityTracker } from "../core/ActivityTracker";
import { HydrationEngine } from "../core/HydrationEngine";
import { UiLoop } from "../loops/UiLoop";
import { BaseHandler } from "./BaseHandler";
import { world } from "@minecraft/server";

export class PlayerLifecycleHandler extends BaseHandler {
  private readonly tracker: ActivityTracker;
  private readonly uiLoop: UiLoop;

  constructor(hydrationEngine: HydrationEngine, tracker: ActivityTracker, uiLoop: UiLoop) {
    super(hydrationEngine);
    this.tracker = tracker;
    this.uiLoop = uiLoop;
  }

  protected registerListeners(): void {
    world.afterEvents.playerSpawn.subscribe((event) => {
      if (event.initialSpawn) {
        this.hydrationEngine.initializePlayer(event.player);
        return;
      }

      this.hydrationEngine.resetPlayer(event.player);
    });

    world.afterEvents.playerLeave.subscribe((event) => {
      this.tracker.cleanupPlayer(event.playerId);
      this.hydrationEngine.cleanupPlayer(event.playerId);
      this.uiLoop.cleanupPlayer(event.playerId);
    });
  }
}

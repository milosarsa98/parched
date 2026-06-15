import { Player } from "@minecraft/server";
import { IHydrationDrainRateContributor } from "../types/hydration";
import { ActivityTracker } from "../core/ActivityTracker";

export class ActivityModifier implements IHydrationDrainRateContributor {
  private readonly tracker: ActivityTracker;

  constructor(tracker: ActivityTracker) {
    this.tracker = tracker;
  }

  public calculateDrainRate(player: Player): number {
    const exertion = this.tracker.consumeExertion(player);

    return exertion;
  }
}

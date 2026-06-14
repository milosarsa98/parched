import { system, world } from "@minecraft/server";
import { HydrationEngine } from "../core/HydrationEngine";
import { AbstractLoop } from "./AbstractLoop";

export class DepletionLoop extends AbstractLoop {
  private readonly hydrationEngine: HydrationEngine;
  private jobId: number | null = null;

  constructor(hydrationEngine: HydrationEngine, tickInterval: number) {
    super(tickInterval);
    this.hydrationEngine = hydrationEngine;
  }

  protected onTick(): void {
    // Logic to decrease hydration levels for all players
    for (const player of world.getAllPlayers()) {
      this.hydrationEngine.processPlayerTick(player);
    }
  }
}

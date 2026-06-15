import { world } from "@minecraft/server";
import { HydrationEngine } from "../core/HydrationEngine";
import { UiRenderer } from "../utils/UiRenderer";
import { AbstractLoop } from "./AbstractLoop";

export class UiLoop extends AbstractLoop {
  private readonly hydrationEngine: HydrationEngine;
  private readonly uiRenderer: UiRenderer;

  constructor(hydrationEngine: HydrationEngine, uiRenderer: UiRenderer, tickInterval: number) {
    super(tickInterval);
    this.hydrationEngine = hydrationEngine;
    this.uiRenderer = uiRenderer;
  }

  protected onTick(): void {
    for (const player of world.getAllPlayers()) {
      this.uiRenderer.renderStatus(player, this.hydrationEngine.getCachedStatus(player));
    }
  }

  public cleanupPlayer(playerId: string): void {
    this.uiRenderer.clearPlayer(playerId);
  }
}

import { system } from "@minecraft/server";

export abstract class AbstractLoop {
  protected intervalId: number | null = null;
  protected readonly tickInterval: number;

  constructor(tickInterval: number) {
    this.tickInterval = tickInterval;
  }

  public start(): void {
    // Start the loop with the specified tick interval
    if (this.intervalId !== null) return;
    this.intervalId = system.runInterval(() => this.onTick(), this.tickInterval);
  }

  public stop(): void {
    // Stop the loop if it's running
    if (this.intervalId === null) return;
    system.clearRun(this.intervalId);
    this.intervalId = null;
  }

  protected abstract onTick(): void;
}

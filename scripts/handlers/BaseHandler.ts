import { HydrationEngine } from "../core/HydrationEngine";

export abstract class BaseHandler {
  protected readonly hydrationEngine: HydrationEngine;
  private isRegistered = false;

  constructor(hydrationEngine: HydrationEngine) {
    this.hydrationEngine = hydrationEngine;
  }

  public register(): void {
    if (this.isRegistered) return;

    this.registerListeners();
    this.isRegistered = true;
  }

  protected abstract registerListeners(): void;
}

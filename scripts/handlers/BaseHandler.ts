import { HydrationEngine } from "../core/HydrationEngine";

export abstract class BaseHandler {
  protected readonly hydrationEngine: HydrationEngine;

  constructor(hydrationEngine: HydrationEngine) {
    this.hydrationEngine = hydrationEngine;
    this.registerListeners();
  }

  protected abstract registerListeners(): void;
}

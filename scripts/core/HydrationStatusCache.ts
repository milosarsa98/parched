import { IHydrationConfig, IPlayerStatus } from "../types/hydration";

export class HydrationStatusCache {
  private readonly config: IHydrationConfig;
  private readonly latestPlayerStatuses = new Map<string, IPlayerStatus>();

  constructor(config: IHydrationConfig) {
    this.config = config;
  }

  public remember(playerId: string, currentHydration: number, depletionRate?: number): IPlayerStatus {
    const status = this.buildStatus(currentHydration, depletionRate);
    this.latestPlayerStatuses.set(playerId, status);

    return status;
  }

  public get(playerId: string): IPlayerStatus | undefined {
    return this.latestPlayerStatuses.get(playerId);
  }

  public clear(playerId: string): void {
    this.latestPlayerStatuses.delete(playerId);
  }

  private buildStatus(currentHydration: number, depletionRate?: number): IPlayerStatus {
    return {
      currentHydration,
      maxHydration: this.config.maxHydration,
      isCritical: currentHydration <= this.config.criticalThreshold,
      depletionRate: depletionRate !== undefined ? depletionRate : this.config.baseDrainRate,
    };
  }
}

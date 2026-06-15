import { Player } from "@minecraft/server";

export interface IHydrationConfig {
  readonly baseDrainRate: number;
  readonly tickInterval: number;
  readonly uiTickInterval: number;
  readonly maxHydration: number;
  readonly criticalThreshold: number;
  readonly exertionValues: {
    readonly walk: number;
    readonly sprint: number;
    readonly jump: number;
    readonly swing: number;
  };
  readonly itemValues: Record<string, number>;
  readonly biomeMultipliers: Record<string, number>;
  readonly dimensionMultipliers: Record<string, number>;
}

export interface IHydrationModifier {
  calculateMultiplier(player: Player): number;
}

export interface IHydrationDrainRateContributor {
  calculateDrainRate(player: Player): number;
}

export interface IPlayerStatus {
  readonly currentHydration: number;
  readonly maxHydration: number;
  readonly isCritical: boolean;
  readonly depletionRate: number;
}

export interface IPunishmentApplier {
  applyExhaustionDebuff(player: Player): void;
  inflictDamage(player: Player, amount: number): void;
  clearEffects(player: Player): void;
}

import { Player, system, world } from "@minecraft/server";
import { IHydrationConfig } from "../types/hydration";

interface IActivityState {
  exertion: number;
}

export class ActivityTracker {
  private readonly activity = new Map<string, IActivityState>();
  private readonly config: IHydrationConfig;
  private samplerId: number | null = null;

  constructor(config: IHydrationConfig) {
    this.config = config;
  }

  public start(): void {
    if (this.samplerId !== null) {
      return;
    }

    this.registerListeners();

    this.startSampler();
  }

  public stop(): void {
    if (this.samplerId === null) return;
    system.clearRun(this.samplerId);
    this.samplerId = null;
  }

  public consumeExertion(player: Player): number {
    const state = this.activity.get(player.id);

    if (!state) {
      return 0;
    }

    const exertion = state.exertion;
    state.exertion = 0;
    return exertion;
  }

  private addExertion(player: Player, amount: number): void {
    const state = this.activity.get(player.id);

    if (state) {
      state.exertion += amount;
      return;
    }

    this.activity.set(player.id, { exertion: amount });
  }

  public cleanupPlayer(playerId: string): void {
    if (this.activity.has(playerId)) {
      this.activity.delete(playerId);
    }
  }

  private registerListeners(): void {
    world.afterEvents.playerSwingStart.subscribe((event) => {
      const { heldItemStack, player } = event;

      // When a player is holding something in his hand add a slight multiplier
      const exertionAmount = this.config.exertionValues.swing * (heldItemStack ? 1.5 : 1);
      this.addExertion(player, exertionAmount);
    });
  }

  private startSampler(): void {
    this.samplerId = system.runInterval(() => {
      this.samplePlayerActivity();
    }, 5);
  }

  private samplePlayerActivity(): void {
    for (const player of world.getAllPlayers()) {
      // Doing this to handle catching player movement, we want to drain a bit faster when walking
      const movementVector = player.inputInfo.getMovementVector();
      if (movementVector.x * movementVector.x + movementVector.y * movementVector.y > 0) {
        this.addExertion(player, this.config.exertionValues.walk);
      }

      if (player.isSprinting) {
        this.addExertion(player, this.config.exertionValues.sprint);
      }

      if (player.isJumping) {
        this.addExertion(player, this.config.exertionValues.jump);
      }
    }
  }
}

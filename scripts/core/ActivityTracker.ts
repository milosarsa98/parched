import { Vector2Utils } from "@minecraft/math";
import { InputButton, Player, system, world, Vector2 } from "@minecraft/server";

interface IActivityState {
  exertion: number;
}

const EXERTION_VALUES = {
  WALKING: 0.005,
  SPRINTING: 0.01,
  JUMPING: 0.08, //
  JUMP: 0.01,
};

export class ActivityTracker {
  private readonly activity = new Map<string, IActivityState>();
  private samplerId: number | null = null;

  public start(): void {
    if (this.samplerId !== null) {
      return;
    }

    world.afterEvents.playerButtonInput.subscribe((event) => {
      const { player, button, newButtonState } = event;

      if (newButtonState !== "Pressed") return;

      if (button === InputButton.Jump) {
        this.addExertion(player, EXERTION_VALUES.JUMPING);
      }
    });

    this.samplerId = system.runInterval(() => {
      for (const player of world.getAllPlayers()) {
        const zeroVector: Vector2 = {
          x: 0,
          y: 0,
        };
        const movementVector = player.inputInfo.getMovementVector();

        if (movementVector.x * movementVector.x + movementVector.y * movementVector.y > 0) {
          this.addExertion(player, EXERTION_VALUES.WALKING);
        }
        if (player.isSprinting) {
          this.addExertion(player, EXERTION_VALUES.SPRINTING);
        }
        if (player.isJumping) {
          this.addExertion(player, EXERTION_VALUES.JUMPING);
        }
      }
    }, 5);
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
}

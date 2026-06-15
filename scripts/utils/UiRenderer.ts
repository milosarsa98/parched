import { Player } from "@minecraft/server";
import { IPlayerStatus } from "../types/hydration";

export class UiRenderer {
  private readonly lastRenderedText = new Map<string, string>();

  public renderStatus(player: Player, status: IPlayerStatus): void {
    const percent = Math.floor((status.currentHydration / status.maxHydration) * 100);

    let color = "§a";
    if (status.isCritical) {
      color = "§c";
    } else if (percent <= 50) {
      color = "§e";
    }

    const text = `${color}Hydration: ${status.currentHydration.toFixed(1)}/${status.maxHydration} (${percent}%)`;

    // if (this.lastRenderedText.get(player.id) === text) {
    //   return;
    // }

    player.onScreenDisplay.setActionBar(text);
    this.lastRenderedText.set(player.id, text);
  }

  public clearPlayer(playerId: string): void {
    this.lastRenderedText.delete(playerId);
  }
}

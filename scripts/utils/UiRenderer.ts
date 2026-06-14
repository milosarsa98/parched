import { Player } from "@minecraft/server";
import { IPlayerStatus } from "../types/hydration";

export class UiRenderer {
  public renderStatus(player: Player, status: IPlayerStatus) {
    const percent = Math.floor((status.currentHydration / status.maxHydration) * 100);

    let color = "§a";
    if (status.isCritical) {
      color = "§c";
    } else if (percent <= 50) {
      color = "§e";
    }

    player.onScreenDisplay.setActionBar(
      `${color}Hydration: ${Math.floor(status.currentHydration)}/${status.maxHydration} (${percent})`
    );
  }
}

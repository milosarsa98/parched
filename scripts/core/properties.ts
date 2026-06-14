/**
 * Data Schemas: world.initializePropertyRegistry definitions
 */

import { IHydrationConfig } from "../types/hydration";
import { system, world, WorldLoadAfterEvent } from "@minecraft/server";

export const PROPERTY_IDS = {
  PLAYER_HYDRATION: "parched:player_hydration",
} as const;

import { HYDRATION_CONFIG } from "./config";
import { HydrationEngine } from "./core/HydrationEngine";
import { DepletionLoop } from "./loops/DepletionLoop";
import { UiRenderer } from "./utils/UiRenderer";
import { EnvironmentModifier } from "./logic/EnvironmentModifier";
import { PunishmentApplier } from "./logic/PunishmentApplier";
import { Logger } from "./utils/Logger";
import { ActivityModifier } from "./logic/ActivityModifier";
import { ActivityTracker } from "./core/ActivityTracker";
import { PlayerLifecycleHandler } from "./handlers/PlayerLifecycleHandler";
import { ItemConsumableHandler } from "./handlers/ItemConsumableHandler";
import { WorldInteractionHandler } from "./handlers/WorldInteractionHandler";

const logger = new Logger("Parched");

const uiRendered = new UiRenderer();
const punishmentApplier = new PunishmentApplier();
const tracker = new ActivityTracker();
tracker.start();

const modifiers = [new EnvironmentModifier(HYDRATION_CONFIG)];
const drainRateContributors = [new ActivityModifier(tracker)];

const hydrationEngine = new HydrationEngine(
  HYDRATION_CONFIG,
  modifiers,
  drainRateContributors,
  punishmentApplier,
  uiRendered,
  logger
);

// handlers go here
new PlayerLifecycleHandler(hydrationEngine, tracker);
new ItemConsumableHandler(hydrationEngine, HYDRATION_CONFIG);
new WorldInteractionHandler(hydrationEngine);

const depletionLoop = new DepletionLoop(hydrationEngine, HYDRATION_CONFIG.tickInterval);

depletionLoop.start();

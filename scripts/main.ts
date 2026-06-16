import { HYDRATION_CONFIG } from "./config";
import { HydrationEngine } from "./core/HydrationEngine";
import { DepletionLoop } from "./loops/DepletionLoop";
import { UiLoop } from "./loops/UiLoop";
import { UiRenderer } from "./utils/UiRenderer";
import { EnvironmentModifier } from "./logic/EnvironmentModifier";
import { PunishmentApplier } from "./logic/PunishmentApplier";
import { Logger } from "./utils/Logger";
import { ActivityModifier } from "./logic/ActivityModifier";
import { ActivityTracker } from "./core/ActivityTracker";
import { PlayerLifecycleHandler } from "./handlers/PlayerLifecycleHandler";
import { ItemConsumableHandler } from "./handlers/ItemConsumableHandler";
import { PunishmentLoop } from "./loops/PunishmentLoop";

const logger = new Logger("Parched");

const uiRendered = new UiRenderer();
const punishmentApplier = new PunishmentApplier();
const tracker = new ActivityTracker(HYDRATION_CONFIG);
tracker.start();

const environmentModifier = new EnvironmentModifier(HYDRATION_CONFIG);
const activityModifier = new ActivityModifier(tracker);

const hydrationEngine = new HydrationEngine(HYDRATION_CONFIG, environmentModifier, activityModifier, logger);

// Initializing loops
const depletionLoop = new DepletionLoop(hydrationEngine, HYDRATION_CONFIG.tickInterval);
const uiLoop = new UiLoop(hydrationEngine, uiRendered, HYDRATION_CONFIG.uiTickInterval);
const punishmentLoop = new PunishmentLoop(hydrationEngine, punishmentApplier, HYDRATION_CONFIG.punishTickInterval);

depletionLoop.start();
uiLoop.start();
punishmentLoop.start();

// Initializing handlers
const playerLifecycleHandler = new PlayerLifecycleHandler(hydrationEngine, tracker, uiLoop);
const itemConsumableHandler = new ItemConsumableHandler(hydrationEngine, HYDRATION_CONFIG);

playerLifecycleHandler.register();
itemConsumableHandler.register();

src/
├── main.ts # 1.1 App Bootstrapper: runtime instantiation & dependency injection
├── config.ts # 4.1 Global Balance Layer: JSON/Object values for items, rates, biomes
│
├── types/
│ └── hydration.ts # 1.2 Type Contracts: IHydrationConfig, IHydrationModifier, IPunishmentApplier
│
├── core/
│ ├── properties.ts # 1.2 Data Schemas: world.initializePropertyRegistry definitions
│ └── HydrationEngine.ts # 1.2/2.1 Central Brain: Dictates data pipeline flow and state updates
│
├── loops/
│ ├── AbstractTicker.ts # 2.1 Engine Clock Base: Controls thread interval loops cleanly
│ ├── DepletionTicker.ts # 2.1 Ticking Controller: Tells engine when to update active player states
│ └── PunishmentTicker.ts # 3.2 Attrition Controller: Tells engine when to damage zero-hydration players
│
├── handlers/
│ ├── BaseHandler.ts # 4.1 Event Base Class: Abstract layout for native event bindings
│ ├── PlayerLifecycleHandler.ts # 1.2 Identity Monitor: Initializes, respawns, and cleans up players
│ ├── ItemConsumableHandler.ts # 4.1 Consumption Interceptor: Tracks when players drink items
│ └── WorldInteractionHandler.ts # 4.2 Environmental Interceptor: Intercepts block clicking & source lookups
│
├── logic/
│ ├── ActivityModifier.ts # 2.2 Movement Math: Inspects velocities, sprinting, and jumping vectors
│ ├── EnvironmentModifier.ts # 2.2/Addon Note Weather Math: Computes biomes, nether scaling, and midday sun exposure
│ └── PunishmentApplier.ts # 3.1/3.2 Execution Service: Dispatches debuffs and starvation damage causes
│
└── utils/
├── Raycast.ts # 4.2 Geometry Core: Direct crosshair vector tracing for water sources
├── UiRenderer.ts # 5.1 Presentation UI: Handles color transitions and action-bar displays
└── FeedbackFX.ts # 5.2 Sound & Camera Effects: Triggers heartbeat audio and warning screen shakes

# Parched

Hydration addon for bedrock.

Basically you lose hydration over time and if you ignore it long enough the game starts being annoying on purpose.

stuff in here right now:

- hydration drain
- biome + dimension modifiers
- activity based drain
- item hydration values
- debuffs when you're too low
- action bar ui with a faster refresh loop

all the actual code i care about is in `scripts/`.

- `main.ts` wires stuff together
- `core/` is the main hydration logic
- `logic/` is modifier / punishment stuff
- `handlers/` is event hooks
- `utils/` is random support stuff
- `config.ts` is where i mess with balance numbers and exertion values

build:

```powershell
npm install
npm run build
```

watch / local deploy:

```powershell
npm run local-deploy -- --watch
```

package it:

```powershell
npm run mcaddon
```

Current future plan is making a custom drinking item because empty hand water interaction is annoying and bedrock is being bedrock. The plan is to add a drinking filter straw that would serve as a medium between the water block and the player.

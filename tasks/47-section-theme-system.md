---
status: done
---

# PRD: Section Theme System

## Problem

The `/app` experience has five sections, each with a distinct Spirit particle color palette already defined in `spirit-presets.ts`. But the UI layer (ghost title in `AppPageShell`, home title in `AppHomePage`) uses hardcoded teal values that are completely disconnected from the Spirit colors. There is no single source of truth for "what is the color of this section?" — three separate files independently define color values, and changing one doesn't affect the others. The result: ghost titles look uniformly grayish regardless of section, and there is no architectural path to "change the How It Works theme from green to something else and have everything follow."

## Goals

- [ ] A single `section-themes.ts` file is the authority for per-section colors — Spirit and UI both consume from it
- [ ] Each section theme defines three shades: `dark` (Spirit dying particles), `mid` (Spirit alive particles), `light` (UI ghost title)
- [ ] appMachine stores `currentTheme: SectionTheme` in context, updated on every `ROUTE_CHANGED`
- [ ] Routes without a configured theme fall back to `DEFAULT_THEME` — new routes never break
- [ ] Spirit receives enriched `SET_PRESET` carrying theme colors — one event, no second color event needed
- [ ] `AppPageShell` reads `currentTheme.light` from appMachine context for the ghost title
- [ ] `AppHomePage` reads `currentTheme.light` from appMachine context for the "Front Desk" title
- [ ] Changing one hex value in `section-themes.ts` updates both the Spirit particle color AND the ghost title color simultaneously

## Non-Goals

- CSS custom properties / runtime theme switching via DOM
- Changing Spirit physics parameters (speed, curl, radius) — themes are color-only
- New Spirit presets or changes to physics values in `spirit-presets.ts`
- Per-section animations on the title (future task)
- Descriptor text color theming (can use `theme.light` at lower opacity without extra fields)

## User Stories

- As a developer, I change one hex value in `section-themes.ts` and both the ghost title AND the Spirit particle color update on that section — no other files touched.
- As a developer, I add a new `/app/new-route` without defining a theme for it — the route loads with the default blue theme, no errors, no broken UI.
- As a visitor on `/app/how-it-works`, the ghost title "How It Works" is visibly green-tinted — clearly distinct from the blue Home title and purple Pricing title.
- As a visitor navigating between sections, the ghost title color changes to match the new section's theme alongside the Spirit particle transition.
- As a visitor on `/app`, the "Front Desk" title color is driven by the blue theme rather than a hardcoded teal — consistent with the theme system.

## Key Decisions

| Decision | Choice | Rejected alternatives |
|---|---|---|
| Theme authority | New `section-themes.ts` independent of spirit presets | Derive theme from spirit presets (coupling); derive spirit from theme (breaks storm/drift presets) |
| Spirit integration | Extend `SET_PRESET` event with optional `color1`/`color2` overrides | Send `SET_PRESET` then `CHANGE_COLORS` (two events, user rejected); new `SET_THEME` event (unnecessary new event type) |
| Default fallback | `DEFAULT_THEME = THEMES.blue` — any unknown route uses blue | Throw/warn on missing theme (bad DX); require all routes to have themes (fragile) |
| Context storage | `currentTheme: SectionTheme` in appMachine context | Derive in component from `currentRoute` (fine but skips XState as truth); separate ThemeContext (extra provider) |
| appMachine action split | Two actions on ROUTE_CHANGED: `setCurrentTheme` (assign) + `sendRouteToSpirit` (fire-and-forget) | One mega-action (mixes assign + side effects, XState anti-pattern) |
| Spirit preset colors | Keep `color1`/`color2` in presets as fallback — theme overrides when present | Strip colors from presets (breaks storm/drift which have no theme) |
| `AppHomePage` title | Read `currentTheme.light` from context — changes from hardcoded `#668a93` | Keep hardcoded (defeats the system); only apply to non-home pages (inconsistent) |

## Theme Color Values

```ts
// section-themes.ts
export const THEMES: Record<string, SectionTheme> = {
  blue: {                              // Home / default
    dark:  '#001020',                  // was spirit-presets default.color1
    mid:   '#00446d',                  // was spirit-presets default.color2
    light: '#5ba3c9',                  // new: sky blue UI title
  },
  green: {                             // How It Works
    dark:  '#001508',                  // was howItWorks.color1
    mid:   '#005228',                  // was howItWorks.color2
    light: '#3d9e60',                  // new: medium green UI title
  },
  purple: {                            // Pricing
    dark:  '#0a0015',                  // was pricing.color1
    mid:   '#340060',                  // was pricing.color2
    light: '#9060d0',                  // new: medium purple UI title
  },
  teal: {                              // Sign In
    dark:  '#001518',                  // was signIn.color1
    mid:   '#005568',                  // was signIn.color2
    light: '#3aaac0',                  // new: medium teal UI title
  },
  amber: {                             // Get Started
    dark:  '#180a00',                  // was getStarted.color1
    mid:   '#6b3200',                  // was getStarted.color2
    light: '#d06030',                  // new: warm amber UI title
  },
}

export const DEFAULT_THEME = THEMES.blue
```

## Data Flow

```
ROUTE_CHANGED { pathname }
  │
  ▼
appMachine
  ├─ setCurrentTheme (assign)
  │    ROUTE_BY_PATH[pathname].theme → THEMES[name] ?? DEFAULT_THEME
  │    → context.currentTheme = theme
  │
  ├─ sendRouteToSpirit (fire-and-forget)
  │    spiritActorRef.send({
  │      type: "SET_PRESET",
  │      name: routeDef.preset,
  │      color1: theme.dark,    ← theme overrides preset colors
  │      color2: theme.mid,
  │    })
  │
  └─ playNavSfx (unchanged)

AppPageShell                    AppHomePage
  reads context.currentTheme      reads context.currentTheme
  → h1 color: theme.light         → h1 color: theme.light

Spirit applyPreset action
  base = PRESETS[e.name]          ← physics from preset
  color1 = e.color1 ?? base.color1  ← color from theme OR preset fallback
  color2 = e.color2 ?? base.color2
```

## Modules Affected

### New
- `apps/web/src/data/section-themes.ts`
  - `SectionTheme` interface: `{ dark: string; mid: string; light: string }`
  - `THEMES` record: 5 named themes (blue, green, purple, teal, amber)
  - `DEFAULT_THEME` export

### Modified
- `apps/web/src/pages/app/routes.ts`
  - Each route definition gains `theme: string` field
  - `AppRouteDef` type updated

- `apps/web/src/pages/app/machine/appMachine.types.ts`
  - `AppContext` gains `currentTheme: SectionTheme`

- `apps/web/src/pages/app/machine/appMachine.ts`
  - `setCurrentTheme` new assign action (replaces nothing, added to ROUTE_CHANGED)
  - `forwardPreset` renamed to `sendRouteToSpirit`, enriched with `color1`/`color2` from theme
  - `ROUTE_CHANGED` in `view.loading` and `view.active` states: add `"setCurrentTheme"` action
  - Initial context: `currentTheme: DEFAULT_THEME`

- `apps/web/src/lib/spirit/spiritMachine.types.ts`
  - `SET_PRESET` event extended: `color1?: string; color2?: string`

- `apps/web/src/lib/spirit/spiritMachine.ts`
  - `applyPreset` action: `color1: e.color1 ?? to.color1`, same for color2

- `apps/web/src/pages/app/AppPageShell.tsx`
  - Import `useAppMachine`
  - Read `currentTheme` from context
  - Apply `theme.light` to ghost title inline style

- `apps/web/src/pages/app/AppHomePage.tsx`
  - Import `useAppMachine`
  - Read `currentTheme` from context
  - Apply `theme.light` to "Front Desk" title inline style (replaces hardcoded `#668a93`)

## Success Criteria

- Navigate to `/app/how-it-works` — ghost title is visibly green, Spirit particles are green
- Navigate to `/app/pricing` — ghost title is visibly purple, Spirit particles are purple
- Navigate to `/app` — "Front Desk" title reflects the blue theme
- Change `THEMES.green.light` to `'#ff0000'` — only the How It Works ghost title turns red, nothing else breaks
- Change `THEMES.green.mid` to `'#00ff00'` — only the How It Works Spirit particle color changes
- Navigate to any route not in `ROUTE_BY_PATH` — blue default theme loads, no console error
- All existing E2E tests in `app-route.spec.ts`, `app-navigation.spec.ts`, `app-mobile-menu.spec.ts`, `app-how-it-works.spec.ts` continue to pass
- `bun run build` exits 0

## Open Questions

- `AppHomePage` `light` color changes from `#668a93` (muted teal) to `#5ba3c9` (sky blue) — tune in browser, the user may prefer a different blue
- Should `light` opacity for ghost title remain at CSS level (applied in AppPageShell inline style) or should it be a fourth theme field `ghost`? Starting with CSS-level: `rgba` from `theme.light` at ~80% opacity gives flexibility without new fields
- `storm` and `drift` presets are used outside the app route context — they have no theme. Confirm these remain purely Spirit-internal with no theme system involvement

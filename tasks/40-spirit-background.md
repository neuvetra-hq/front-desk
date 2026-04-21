---
status: done
---
# Task 40: The Spirit WebGL Background for /app

## What was done
- Installed three@0.184.0 in apps/web
- Created apps/web/src/lib/spirit/shaders.ts — all GLSL as TS string constants
  (glslify deps inlined: simplexNoiseDerivatives4 + curl4; shadows removed)
- Created apps/web/src/lib/spirit/simulator.ts — SpiritSimulator GPGPU class
  (position update via WebGLRenderTarget ping-pong; adapted r74→r184 API)
- Created apps/web/src/lib/spirit/particles.ts — SpiritParticles class
  (triangle mesh + point mesh; EffectComposer + UnrealBloomPass)
- Created apps/web/src/data/spirit-presets.ts — default/storm/drift presets + AUDIO + AUTO_CYCLE
- Created apps/web/src/lib/spirit/engine.ts — AudioEngine + SpiritEngine
  (smoothstep transitions, auto-cycle timer, figure-8 follow point, init ramp)
- Created apps/web/src/hooks/useSpirit.ts — React hook
- Replaced AppPage.tsx with full-screen canvas background + z-10 HTML overlay
- Added apps/web/tests/spirit-background.spec.ts
- Updated apps/web/tests/app-route.spec.ts

## Key decisions
- Source: edankwan/The-Spirit (MIT) — ported r74→r184, glslify inlined, shadows removed
- WebGL GPGPU (not WebGPU compute): particle positions stored in float texture,
  updated each frame via fragment shader render-to-texture (two ping-pong targets)
- curl noise: 3-octave 4D simplex noise derivatives — gives the organic fluid movement
- Triangle particles: two alternating corner sets flip each frame (flipRatio XOR)
  creating the shimmery crystalline appearance
- follow point: auto-animated Lissajous figure-8 path — HTML overlay takes pointer events
- initAnimation: ramps 0→1 over 3 s driving the particle rise-from-below intro
- useTriangles is NOT lerped between presets (boolean, switches immediately)
- AudioEngine: Web Audio API gapless loop, unlock() on first user interaction

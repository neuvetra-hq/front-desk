# typecheck

Run `tsc --noEmit` across every workspace package.

```bash
pnpm typecheck
```

Runs `turbo run typecheck` which executes the `typecheck` script in every app/package in parallel.
No JavaScript is emitted — this is a type-only validation pass.

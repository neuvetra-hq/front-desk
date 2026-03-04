# lint-all

Run ESLint and TypeScript checks across every workspace package.

```bash
pnpm lint
```

Runs `turbo run lint` which executes the `lint` script in every app/package in parallel.
Fix all reported errors before committing — CI will reject lint failures.

# TODO - UI cleanup & developer tooling isolation

- [x] Implement DEV_MODE gating in `src/App.tsx` to hide AI Studio prototype UI in production.
      - [x] Use `const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";`
      - [x] Wrap SubdomainSimulator rendering behind DEV_MODE.
      - [x] Wrap floating "View SQL & Schemas" button behind DEV_MODE.
      - [x] Wrap DevDocs modal overlay behind DEV_MODE.
      - [x] Keep App.tsx JSX valid (no unterminated comments).

- [x] Run `npm run dev` (compile/start).
- [x] Run `npm run build` (compile/bundle).
- [ ] Fix TS error for DEV_MODE gating.


- [x] Report files modified + verification results.




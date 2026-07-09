# Design Tokens

**Authority:** [`docs/SOURCE_OF_TRUTH.md`](../docs/SOURCE_OF_TRUTH.md)  
**Canonical file:** `tokens.json` in this directory

## Usage (Phase 2+)

```js
import { colors, themes, spacing } from '@/src/design-tokens';
// or
import tokens from '@/src/design-tokens/tokens.json';
```

## Rules

1. Do **not** hardcode brand hex values in pages or components
2. Do **not** add new colors to `tailwind.config.js` without updating `tokens.json` first
3. `app/globals.css` and `tailwind.config.js` `brand.*` are **legacy** until Phase 2 migrates them here

## Precedence

If `globals.css`, `tailwind.config.js`, or inline styles conflict with `tokens.json`, **`tokens.json` wins** for all new V2 work.

# GIX Three.js / React Three Fiber (Phase 2)

Premium marketing 3D scenes — lazy-loaded, `prefers-reduced-motion` safe.

## Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
```

## Components

| Component | Use |
|-----------|-----|
| `SceneCanvas` | WebGL wrapper + fallback |
| `HeroEcosystemScene` | Homepage cinematic hero background |
| `RetailStoreScene` | RetailEdge360 product page |
| `CrmPipelineScene` | LeadEdge360 product page |
| `TrinetraNocScene` | Trinetra360 product page |
| `ProductExperienceSection` | Section + scene for product landings |

## Performance

- All scenes use `dynamic(..., { ssr: false })`
- `dpr={[1, 1.5]}` cap on Canvas
- Reduced motion → CSS aurora fallback (no WebGL)
- Keep polygon counts low for mobile 4G

## Files

```
components/gix/three/
  SceneCanvas.jsx
  R3FCanvas.jsx
  HeroEcosystemScene.jsx
  RetailStoreScene.jsx
  CrmPipelineScene.jsx
  TrinetraNocScene.jsx
  ProductExperienceSection.jsx
  scenes/*Inner.jsx
```

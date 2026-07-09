/**
 * Canonical design tokens — single import point for V2 frontend work.
 * Source file: src/design-tokens/tokens.json
 * Authority:   docs/SOURCE_OF_TRUTH.md
 *
 * Phase 2+ MUST use this module instead of hardcoded colors in pages or tailwind.config.
 */
import tokens from './tokens.json';

export const brand = tokens.brand;
export const typography = tokens.typography;
export const spacing = tokens.spacing;
export const radius = tokens.radius;
export const shadows = tokens.shadows;
export const elevation = tokens.elevation;
export const animation = tokens.animation;
export const breakpoints = tokens.breakpoints;
export const focus = tokens.focus;
export const accessibility = tokens.accessibility;
export const themes = tokens.themes;
export const domains = tokens.domains;
export const routes = tokens.routes;
export const frozen = tokens.frozen;
export const components = tokens.components;

/** Official brochure palette — use these hex values only */
export const colors = {
  navy: tokens.brand.colors.navy.hex,
  royalBlue: tokens.brand.colors.royalBlue.hex,
  electricBlue: tokens.brand.colors.electricBlue.hex,
  orange: tokens.brand.colors.orange.hex,
  white: tokens.brand.colors.white.hex,
  lightGray: tokens.brand.colors.lightGray.hex,
};

export default tokens;

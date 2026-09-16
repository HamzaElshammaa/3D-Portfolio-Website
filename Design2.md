---
name: Luminous Obsidian
colors:
  surface: '#fcf8ff'
  surface-dim: '#d7d6ff'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#eeecff'
  surface-container-high: '#e8e6ff'
  surface-container-highest: '#e1e0ff'
  on-surface: '#07006c'
  on-surface-variant: '#5a413b'
  inverse-surface: '#1000a9'
  inverse-on-surface: '#f2efff'
  outline: '#8e7069'
  outline-variant: '#e3beb6'
  surface-tint: '#b42907'
  primary: '#b42907'
  on-primary: '#ffffff'
  primary-container: '#ff5e3a'
  on-primary-container: '#5c0e00'
  inverse-primary: '#ffb4a3'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#bc0b3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff5970'
  on-tertiary-container: '#610019'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#8b1a00'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#fcf8ff'
  on-background: '#07006c'
  surface-variant: '#e1e0ff'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 38px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
This design system embodies high-craft digital precision, combining the spatial optical clarity of luxury hardware interfaces with the kinetic, functional density of modern productivity software. It targets discerning professionals, technologists, and creatives who value structural restraint elevated by atmospheric depth.

The aesthetic philosophy centers on **Luminous Minimalist Spatialism**:
- Clean light foundations paired with warm metallic undertones to prevent eye fatigue while preserving absolute visual contrast.
- Optical physics-inspired surface behavior: semi-translucent frosted layers, low-energy ambient chromatic halos, and edge-lit reflections.
- Precise, weightless interaction models designed to feel responsive, tactile, and frictionless under continuous spatial interaction.

## Colors
The palette balances an ultra-light clean field with controlled, dynamic points of light:

- **Base Field (`#F8FAFC`)**: Deep, low-saturation neutral canvas establishing high-contrast readability.
- **Surface Elevation Levels**:
  - `Surface 1 (Base Container)`: `#FFFFFF` with frosted layers.
  - `Surface 2 (Card / Floating Panel)`: `#F1F5F9` with subtle inner specular highlight.
  - `Surface 3 (Hover / Active Overlay)`: `#E2E8F0`.
- **Primary Energy (`#FF5E3A` - Warm Sunset Amber)**: Applied to spatial focus rings, technical badges, system transitions, and primary interactive moments.
- **Secondary Energy (`#000000` - Absolute Dark)**: Reserved for deep anchor points, primary focal calls-to-action, active progress indicators, and critical directional cues.
- **Neutral Accents**:
  - `Text Primary`: `#0F172A`
  - `Text Secondary`: `#475569`
  - `Text Muted`: `#94A3B8`
  - `Borders & Separators`: `rgba(99, 102, 241, 0.08)` baseline, scaling to `rgba(99, 102, 241, 0.16)` on active states.

## Typography
The system employs `Inter` across all primary reading and interface planes, leaning on tighter negative letter tracking to impart modern density, balanced with generous line heights to preserve visual air.

`JetBrains Mono` serves strictly as an auxiliary metadata and metric layer—governing status tags, operational telemetry, timestamp markers, and shortcut indicators. This creates an engineered juxtaposition between human-centric UI and technical precision.

## Layout & Spacing
The layout model is governed by a responsive fluid grid operating on an 8pt architectural rhythm:

- **Desktop (12-column)**: Max container width of `1280px` or `1440px`, flanked by `margin` (`2rem`) and `gutter` (`1.5rem`).
- **Tablet (8-column)**: Fluid stretch down to `768px` breakpoints, scaling `gutter` to `1rem`.
- **Mobile (4-column)**: Single-column flow with pinned bottom-docked navigation modules, bound by `margin-mobile` (`1rem`).

Whitespace must remain clean and structural. Gaps inside nested interactive components leverage `space-xs` and `space-sm`, while top-level container separations strictly adhere to `space-lg` and `space-xl`.

## Elevation & Depth
Elevation is realized through physical optics rather than drop shadows:

1. **Backdrop Blurs & Specular Edges**: Surface tiers (`#F1F5F9`) utilize `backdrop-filter: blur(20px)` at 85% opacity, finished with a subtle interior top border highlight (`linear-gradient(180deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.02) 100%)`).
2. **Radial Energy Emitters**: Selected high-value surfaces feature ambient radial drop gradients:
   - Primary: `radial-gradient(circle at 50% 0%, rgba(255, 94, 58, 0.15) 0%, transparent 70%)`
   - Secondary: `radial-gradient(circle at 100% 100%, rgba(0, 0, 0, 0.08) 0%, transparent 60%)`
3. **Z-Axis Hierarchy**:
   - `Layer 0 (Canvas)`: Flat light canvas (`#F8FAFC`).
   - `Layer 1 (Card/Dock)`: Surface 2 with `box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.08)`.
   - `Layer 2 (Popovers/Flyouts)`: Elevated with `box-shadow: 0 16px 48px -8px rgba(0, 0, 0, 0.15)` and hairline borders (`rgba(99,102,241,0.14)`).

## Shapes
Geometry uses soft, curved silhouettes calibrated to modern spatial viewports:

- **Standard Elements (Buttons, Inputs, Badges)**: Rounded tokens at `0.5rem` to `1rem` ensure natural touch target ergonomics.
- **Large Panels & Glass Cards**: Standardized to `rounded-xl` (`1.5rem`) and `rounded-2xl` (`2rem`) to soften high-density data views.
- **Pill Badges & Segmented Controls**: Retain full corner rounding (`9999px`) to immediately signal interactive toggles or status state indicators.

## Components

### Buttons
- **Primary**: Solid background `#FF5E3A`, text `#FFFFFF`, rounded `0.75rem`. Features an ultra-soft amber glow on hover (`box-shadow: 0 0 24px rgba(255, 94, 58, 0.4)`). Active state applies a micro-scale transition (`scale(0.98)`).
- **Secondary / Ghost**: Translucent `#F1F5F9` at 60% fill, border `1px solid rgba(99, 102, 241, 0.08)`, text `#0F172A`. On hover, the border shifts to `rgba(255, 94, 58, 0.4)` with a warm sunset amber inner wash.

### Cards & Spatial Containers
- Background: Surface 2 (`#F1F5F9`) overlaid with a subtle linear gradient angle.
- Radius: `rounded-xl` (1.5rem).
- Border: `1px solid rgba(99, 102, 241, 0.07)`.
- Interactive cards tilt subtly under cursor tracking, displaying an adaptive radial highlight along the border perimeter.

### Chips & Pill Badges
- Pill form factor (`rounded-full`), padded with `space-xs` vertically and `space-sm` horizontally.
- Typographic style: `label-sm` (`JetBrains Mono`).
- Visual variants:
  - Technical: Background `rgba(255, 94, 58, 0.1)`, text `#FF5E3A`, border `rgba(255, 94, 58, 0.25)`.
  - Signal: Background `rgba(0, 0, 0, 0.05)`, text `#0F172A`, border `rgba(99, 102, 241, 0.25)`.

### Inputs & Form Elements
- Containers: Height `42px`, background `#FFFFFF`, border `1px solid rgba(99, 102, 241, 0.12)`, text `#0F172A`.
- Focus State: Zero harsh browser outlines; transition border to `#FF5E3A` with an ambient glow (`box-shadow: 0 0 0 3px rgba(255, 94, 58, 0.2)`).
- Placeholders: `#94A3B8`.

### Selection Controls (Checkboxes & Radios)
- Checkboxes: `18px` geometric box, radius `0.375rem`. Inactive state features light inset background `#FFFFFF` with `rgba(99, 102, 241, 0.15)` border. Checked state transitions smoothly to `#FF5E3A` with a crisp white glyph.
- Radio buttons: Outer ring `#FFFFFF` with active `#FF5E3A` core dot.
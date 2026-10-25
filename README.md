<div align="center">

# Interactive 3D & Multi-Theme Developer Portfolio 🌐

### **Dual-Mode 3D Spline State Machine & Multi-Theme Next.js 16 Portfolio**

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Spline 3D](https://img.shields.io/badge/Spline-3D_WebGL-FF3366?style=for-the-badge)](https://spline.design/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

*A high-craft personal portfolio for **Hamza El-Shammaa** that blends an interactive 3D WebGL room experience with a resilient 2D multi-theme engine.*

</div>

---

## ✨ Key Architectural Features

### 1. Resilient 3D Spline Scene State Machine (`components/spline/`)
- **Deterministic Phase Lifecycle:** Manages transitions across loading, interactive camera states, and theme handoffs (`useSplineSceneMachine.ts`).
- **Hardware & Watchdog Gatekeeping (`SplineFlowGate.tsx`, `useSceneLoadWatchdog.ts`):** Automatically probes device WebGL/viewport capabilities (`lib/device-support.ts`) and enforces a load-time watchdog timer so low-power or mobile devices gracefully bypass heavy 3D assets into the fast 2D flow.

### 2. Pluggable Multi-Theme Registry (`themes/`)
- Decouples site content (`content/site-content.ts`) from visual presentation via a typed theme registry (`themes/registry.tsx`).
- Includes an **Apple-inspired flagship theme** (`themes/apple/`) with modular `Hero`, `Work`, `AboutServices`, `Testimonials`, and `Contact` sections, plus a live `FloatingSwitcher` for instant theme switching without page reloads.

### 3. Comprehensive Component & State Test Suite
- Full unit and integration test coverage with **Vitest** and **React Testing Library** across the 3D scene machine, watchdog timers, theme round-trip rendering, and contact API route (`app/api/contact/route.test.ts`).

---

## 📂 Project Structure

```text
├── app/
│   ├── api/contact/          # Contact form submission API route + unit tests
│   ├── layout.tsx            # Root layout & typography configuration
│   └── page.tsx              # Entry point wiring SplineFlowGate & ThemeProvider
├── components/
│   ├── picker/               # 2D interactive theme card picker
│   ├── spline/               # 3D WebGL Spline layer, gatekeeper & state machine hooks
│   ├── FloatingSwitcher.tsx  # Persistent HUD for switching themes & 2D/3D modes
│   └── ThemeRenderer.tsx     # Dynamic theme dispatcher
├── content/
│   └── site-content.ts       # Single source of truth for projects, services & bio
├── lib/
│   ├── device-support.ts     # WebGL & viewport capability detection
│   ├── scene-phase.ts        # State machine transitions
│   └── theme-context.tsx     # React context for active theme & mode persistence
└── themes/
    ├── apple/                # Flagship Apple-style editorial theme components
    └── registry.tsx          # Theme definitions and structural assertions
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Run the Vitest test suite
npm test

# 4. Production build
npm run build
```

# Project Status Report - June 8, 2026

This document records the exact state of **its-my-plan** after completing the UI polish, persistent measurements, custom wall colors, free rotation controls, and advanced estimating and takeoff enhancements (plasterboard, coving, skirting, opening schedules, floor areas, and PDF logo improvements).

---

## 🚀 Live Environment

* **Production Application**: [https://plan.itsmyapp.co.uk](https://plan.itsmyapp.co.uk)
* **Vercel Project**: Deployed successfully to production.
  > [!IMPORTANT]
  > **Deploy Procedure**: Always deploy straight to Production using `npx vercel --prod --yes` (avoiding preview-only deploys) to keep the live URL in sync with code updates.
* **Git Repository**: Branch `master` is up to date (all changes committed and pushed).

---

## 🛠️ Completed Enhancements & Features

### 1. Estimating, Takeoff & PDF Enhancements
* **Proper Logo on PDFs**: Replaced the vector colored squares with the high-fidelity brand logo (`/its-my-plan.png`) on all PDF sheets (Blueprint headers/footers, Takeoff headers).
* **Plasterboard Estimation**: Added plasterboard finishing configuration options (`None`, `One Side`, `Both Sides`) to walls and calculated standard UK sheet sizes (2.4m x 1.2m and 1.8m x 0.9m) with a 10% waste buffer.
* **Opening Specification Schedules**: Enabled custom specs/notes for doors and windows in properties settings, rendered unique ID tags (e.g. `D1`, `W1`) inside opening badges on the 2D blueprint, and output a full Opening Schedule table in both the UI panel and PDF prints.
* **Trims & Insulation Runs**: Integrated skirting board lengths (excluding door widths), door architrave counts, and insulation roll areas into the PDF layout and UI.
* **Robust Floor Area calculations**: Added a recursive dangling-wall cycle detector to accurately calculate closed room areas and handle open layouts. Displays `0.00 m² (Open layout)` for unclosed boundaries.
* **Multi-Page Takeoff PDF**: Implemented a professional PDF layout engine with automatic pagination (page chrome, margins, headers/footers) to support large projects.

### 2. Persistent & Deletable Measurements Layer
* **Store Integration**: Created actions `addMeasurement` and `deleteMeasurement` in Zustand state.
* **Drawing Persistence**: Dragging with the Measure tool now saves the measurement line permanently in the plan object.
* **Selection & Deletion**: Clicking on a measurement line selects it (visually highlighting it in orange), making it deletable via the Delete button (Toolbar) or the Delete key.
* **Interactive Line Trails**: Enhanced with dashed lines, circular end handles, and background-colored measurement bubbles displaying values in mm.

### 3. Layer & Toolbar Polish
* **Toggle Layer**: Added a new **Ruler** button to the toolbar that controls the visibility of the Dimensions/Measurements layer (`showDimensions`).
* **Auto-Dimensions Control**: Wrapped automatic wall and opening dimensions in conditional blocks to hide them when the dimensions layer is toggled off.
* **Material Takeoff**: Changed the Material Takeoff icon to a **Calculator** to distinguish it from the Ruler (Dimensions Layer) toggle.

### 4. Wall Colors Presets
* **Properties Integration**: Walls now support custom `color?: string` overrides.
* **Color Preset Grid**: Selection of any wall opens a color palette preset block (Off-white, Slate Gray, Soft Sage, Terracotta, Deep Blue, Oak Wood) in the Properties Panel.
* **2D & 3D Render**: Both the 2D SVG canvas and 3D Three.js dollhouse view render using the selected wall color.

### 5. Fine Rotation Controls
* Added a **Fine Rotation** section to the selected fixture's properties panel.
* Offers a slider from `0°` to `360°` and a numeric input box for arbitrary rotation values.

### 6. UK Fixture Library Improvements
* **Default Collapsed Categories**: The library palette starts with all categories (Bathroom, Kitchen, Bedroom, Furniture, etc.) collapsed by default, allowing independent expansion/collapsing.
* **Scale Figure (Adult)**: Added a standing adult figure that draws as a human silhouette in 2D and a 3D composite head/torso avatar in 3D.
* **New UK Assets**:
  * *Bathroom*: Double Vanity Basin, Freestanding Bath.
  * *Kitchen*: Kitchen Island, Corner Base Unit, Cooker/Hob Module, Wall Cabinet.
  * *Bedroom*: Single Bed, Chest of Drawers.
  * *Furniture*: 3-Seater Sofa, 2-Seater Sofa, Armchair, Dining Table.
* **Asset Realism**: Replaced plain box shapes with detailed 2D/3D representations (cushion divisions, armrests, table legs, sink bowls, taps, and hobs).

### 7. Clean Authentication Header UI
* Removed connection badges from the top-right header section.
* Modified the logout button to display the full user name or email address instead of just the email prefix.

---

## 💾 Database & Sync Architecture

* **Auto-Save Hook**: The debounced (500ms) auto-save listener detects changes to the plan structure (including new wall colors and custom measurements) and automatically commits them to `localStorage` and **Firestore** (when logged in).
* **Firestore Schema**: Custom measurements and wall colors are fully serialized inside the room plan object.
* **Security Rules**: Deployed Firestore rules permit read/write access to authenticated owners:
  ```javascript
  match /users/{userId}/plans/{planId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```

---

## 📁 Modified Files

The following files were updated, committed, and pushed to `master`:
* **Core & Store**:
  * [types.ts](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/types.ts) — Data model updates for measurements, wall colors, selection types, plasterboard, specifications.
  * [usePlanStore.ts](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/store/usePlanStore.ts) — Add/delete measurement actions, history state mapping, Point types import.
* **Components**:
  * [AppShell.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/AppShell.tsx) — Removed header sync status badges.
  * [HamburgerMenu.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/HamburgerMenu.tsx) — Render full user displayName or email on logout button.
  * [Toolbar.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/Toolbar.tsx) — Added Calculator (Takeoff) and Ruler (Dimensions Layer) buttons.
  * [PropertiesPanel.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/PropertiesPanel.tsx) — Wall color preset grid, free rotation controls, plasterboard selections, opening specs, and measurement details.
  * [FixturePalette.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/ui/FixturePalette.tsx) — Collapsed state defaults and individual category toggles.
  * [TakeoffPanel.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/ui/TakeoffPanel.tsx) — Added drylining, trims, coving, and openings schedules cards.
* **2D Canvas Layer**:
  * [Canvas2D.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas2d/Canvas2D.tsx) — Persistent measurements drawing, selection highlights, and clicking.
  * [WallSegment.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas2d/WallSegment.tsx) — Conditionally render dimensions, support wall custom colors.
  * [FixtureIcon.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas2d/FixtureIcon.tsx) — SVG symbols updates and syntax/closing brace fixes.
  * [OpeningOverlay.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas2d/OpeningOverlay.tsx) — Draw unique identifier badges centered on doors and windows.
* **3D Canvas Layer**:
  * [Wall3D.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas3d/Wall3D.tsx) — Material colors for custom walls.
  * [Fixture3D.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas3d/Fixture3D.tsx) — Multi-mesh realistic components.
* **Utilities & Data**:
  * [fixtures.ts](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/data/fixtures.ts) — New UK standard fixture dimensions and classifications.
  * [takeoff.ts](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/utils/takeoff.ts) — Structural timber Linear Run, Board count nesting calculations, plasterboard sheets, trims, architraves, insulation area, and graph-based room floor area.
  * [openingHelpers.ts](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/utils/openingHelpers.ts) — Added opening label generator.
  * [exportHelpers.ts](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/utils/exportHelpers.ts) — Integrated PDF logo headers and printed A4 tables for all takeoff sheets.

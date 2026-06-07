# Project Status Report - June 7, 2026

This document records the exact state of **its-my-plan** after completing the UI polish, persistent measurements, custom wall colors, free rotation controls, and realistic UK asset library enhancements.

---

## 🚀 Live Environment

* **Production Application**: [https://plan.itsmyapp.co.uk](https://plan.itsmyapp.co.uk)
* **Vercel Project**: deployed successfully to production.
* **Git Repository**: Branch `master` is up to date (all changes committed and pushed).

---

## 🛠️ Completed Enhancements & Features

### 1. Persistent & Deletable Measurements Layer
* **Store Integration**: Created actions `addMeasurement` and `deleteMeasurement` in Zustand state.
* **Drawing Persistence**: Dragging with the Measure tool now saves the measurement line permanently in the plan object.
* **Selection & Deletion**: Clicking on a measurement line selects it (visually highlighting it in orange), making it deletable via the Delete button (Toolbar) or the Delete key.
* **Interactive Line Trails**: Enhanced with dashed lines, circular end handles, and background-colored measurement bubbles displaying values in mm.

### 2. Layer & Toolbar Polish
* **Toggle Layer**: Added a new **Ruler** button to the toolbar that controls the visibility of the Dimensions/Measurements layer (`showDimensions`).
* **Auto-Dimensions Control**: Wrapped automatic wall and opening dimensions in conditional blocks to hide them when the dimensions layer is toggled off.
* **Material Takeoff**: Changed the Material Takeoff icon to a **Calculator** to distinguish it from the Ruler (Dimensions Layer) toggle.

### 3. Wall Colors Presets
* **Properties Integration**: Walls now support custom `color?: string` overrides.
* **Color Preset Grid**: Selection of any wall opens a color palette preset block (Off-white, Slate Gray, Soft Sage, Terracotta, Deep Blue, Oak Wood) in the Properties Panel.
* **2D & 3D Render**: Both the 2D SVG canvas and 3D Three.js dollhouse view render using the selected wall color.

### 4. Fine Rotation Controls
* Added a **Fine Rotation** section to the selected fixture's properties panel.
* Offers a slider from `0°` to `360°` and a numeric input box for arbitrary rotation values.

### 5. UK Fixture Library Improvements
* **Default Collapsed Categories**: The library palette starts with all categories (Bathroom, Kitchen, Bedroom, Furniture, etc.) collapsed by default, allowing independent expansion/collapsing.
* **Scale Figure (Adult)**: Added a standing adult figure that draws as a human silhouette in 2D and a 3D composite head/torso avatar in 3D.
* **New UK Assets**:
  * *Bathroom*: Double Vanity Basin, Freestanding Bath.
  * *Kitchen*: Kitchen Island, Corner Base Unit, Cooker/Hob Module, Wall Cabinet.
  * *Bedroom*: Single Bed, Chest of Drawers.
  * *Furniture*: 3-Seater Sofa, 2-Seater Sofa, Armchair, Dining Table.
* **Asset Realism**: Replaced plain box shapes with detailed 2D/3D representations (cushion divisions, armrests, table legs, sink bowls, taps, and hobs).

### 6. Clean Authentication Header UI
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

The following files were updated and pushed to `master`:
* **Core & Store**:
  * [types.ts](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/types.ts) — Data model updates for measurements, wall colors, selection types.
  * [usePlanStore.ts](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/store/usePlanStore.ts) — Add/delete measurement actions, history state mapping, Point types import.
* **Components**:
  * [AppShell.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/AppShell.tsx) — Removed header sync status badges.
  * [HamburgerMenu.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/HamburgerMenu.tsx) — Render full user displayName or email on logout button.
  * [Toolbar.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/Toolbar.tsx) — Added Calculator (Takeoff) and Ruler (Dimensions Layer) buttons.
  * [PropertiesPanel.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/PropertiesPanel.tsx) — Wall color preset grid, free rotation controls, and measurement details.
  * [FixturePalette.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/ui/FixturePalette.tsx) — Collapsed state defaults and individual category toggles.
* **2D Canvas Layer**:
  * [Canvas2D.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas2d/Canvas2D.tsx) — Persistent measurements drawing, selection highlights, and clicking.
  * [WallSegment.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas2d/WallSegment.tsx) — Conditionally render dimensions, support wall custom colors.
  * [FixtureIcon.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas2d/FixtureIcon.tsx) — SVG symbols updates and syntax/closing brace fixes.
* **3D Canvas Layer**:
  * [Wall3D.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas3d/Wall3D.tsx) — Material colors for custom walls.
  * [Fixture3D.tsx](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/components/canvas3d/Fixture3D.tsx) — Multi-mesh realistic components.
* **Assets Data**:
  * [fixtures.ts](file:///c:/Users/mcozens/Documents/Websites_Apps/Apps/its-my-plan/src/data/fixtures.ts) — New UK standard fixture dimensions and classifications.

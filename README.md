# Game of Life Simulator

A performance-optimized React and TypeScript implementation of Conway's Game of Life. This application simulates zero-player cellular automata on grid sizes ranging from $3\times3$ up to $1000\times1000$ tiles. It utilizes a canvas rendering engine, a flat `Uint8Array` backbuffer to keep memory overhead minimal and performance smooth even at high resolutions.

---

## Live Demo

The application is deployed and available to play online at:
👉 **[https://unforbiddenyet.github.io/game-of-life-sim/](https://unforbiddenyet.github.io/game-of-life-sim/)**

---

## Features

### Core Simulation

- **Dynamic Grid Sizing:** Supports a square grid ranging from $3\times3$ up to $1000\times1000$ tiles.
- **Interactive Control:** Toggle cells between alive and dead by clicking or dragging across the canvas grid.
- **Conway's Engine:** Accurate cell evaluation based on standard Birth, Survival, and Death rules. All cells beyond the borders of the grid are considered dead.
- **State Management:** Fully independent local React state architecture—built entirely without external state management libraries.
- **Import/Export:** Save and restore specific simulation configurations via JSON file uploads.



### Bonus Mechanics Implemented
- **Speed Regulation:** Live control over simulation tick rates. 
- **Time Travel Navigation:** Pause the game to step backwards through historical states.


### Bonus Mechanics TODO
- [ ] **Colorized Inheritance:** Newborn cells dynamically inherit colors from the most prevalent lineage of surrounding cells.


---

## Tech Stack

* **Framework:** React 19 & TypeScript
* **Build Tool:** Vite
* **UI Components:** Radix UI Themes & Lucide Icons
* **Gestures & Shortcuts:** `@use-gesture/react` & `react-hotkeys-hook`
* **Testing:** Vitest & React Testing Library

---

## Getting Started

### Installation

```bash
git clone https://github.com/UnforbiddenYet/game-of-life-sim.git
cd game-of-life-sim
npm install

```

### Development Scripts

* **Start Development Server:** `npm run dev`
* **Build Application:** `npm run build`
* **Preview Production Build:** `npm run preview`
* **Lint Codebase:** `npm run lint`
* **Static Type Check:** `npm run typecheck`

### Testing

Core simulation algorithms and component behaviors are covered by unit tests.

* **Run Tests:** `npm run test`
* **Watch Mode:** `npm run test:watch`
* **Coverage Report:** `npm run coverage`

# Architecture of Zwack

## High-Level Overview

Zwack is a Node.js application that leverages the `bleno` library to act as a Bluetooth Low Energy (BLE) peripheral. It simulates various fitness sensors by broadcasting standard BLE services and characteristics.

## Core Components

### 1. Main Entry Point (`lib/zwack-ble-sensor.js`)

- **Responsibility**: Initializes the `bleno` instance, manages advertising state, and instantiates the specific BLE services.
- **Key Methods**:
  - `notifyCSP(event)`: Updates Cycling Power data.
  - `notifyRSC(event)`: Updates Running Speed & Cadence data.
  - `notifyFTMS(event)`: Updates Fitness Machine data.
- **Service Configuration**: Configures which services to advertise based on command-line arguments (passed via `minimist`).

### 2. BLE Services (`lib/`)

Each supported BLE profile is implemented in its own directory within `lib/`.

- **Device Information Service (DIS)** (`lib/dis/`)
  - Standard BLE service that exposes manufacturer name, model number, etc.
  - Implemented in `device-information-service.js`.

- **Cycling Power Service (CPS)** (`lib/cps/`)
  - Implemented in `cycling-power-service.js`.
  - Contains characteristics like `cycling-power-measurement-characteristic.js` for broadcasting power data.
  - Includes `cycling-power-wahoo-extension-characteristic.js` for legacy Wahoo support.

- **Running Speed and Cadence (RSC)** (`lib/rsc/`)
  - Implemented in `rsc-service.js` (inferred).
  - Broadcasts speed and cadence data for runners.

- **Fitness Machine Service (FTMS)** (`lib/ftms/`)
  - Implemented in `fitness-machine-service.js` (inferred).
  - Simulates an indoor bike trainer, allowing for control (e.g., setting target power).

### 3. Utilities

- **`lib/flags.js`**: A helper class for managing bitmask flags, commonly used in BLE characteristic values (e.g., indicating which fields are present in a data packet).

## Data Flow

1. **Simulator Loop**: The `example/simulator.js` script runs a loop or responds to user input (keyboard events).
2. **Event Emission**: User input or simulation logic triggers updates to sensor values (power, speed, cadence).
3. **Notification**: The simulator calls methods on the `ZwackBLE` instance (e.g., `notifyCSP`), passing an event object with the new data.
4. **Characteristic Update**: The `ZwackBLE` instance delegates this to the appropriate service, which updates the value of its characteristics.
5. **BLE Notification**: `bleno` sends a notification to connected BLE clients (central devices) with the new data.

## Dependencies

- **`bleno` / `@abandonware/bleno`**: The core BLE stack for Node.js.
- **`debug`**: For logging (`ble`, `csp`, `rsc`, `ftms` namespaces).
- **`minimist`**: For parsing command-line arguments.

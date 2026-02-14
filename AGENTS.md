# AI Agent Guide for Zwack

## Project Overview

Zwack is a Node.js-based Bluetooth Low Energy (BLE) sensor simulator. It simulates sensor data for:

- **Cycling Power (CSP)**: Simulates power and cadence.
- **Running Speed and Cadence (RSC)**: Simulates running speed and cadence.
- **Fitness Machine Service (FTMS)**: Simulates an indoor bike trainer (partial support).

The project uses the `bleno` library to broadcast BLE services.

## Key Files & Directories

- **`index.js`**: Entry point for the library.
- **`example/simulator.js`**: The main simulator script used to run the application.
- **`lib/`**: Contains the core logic and BLE service definitions.

## Common Tasks

### Running the Simulator

To start the simulator with specific flags (useful for testing):

```bash
npm run simulator -- --variable=ftms --variable=rsc --variable=csp
```

### debugging

Use the `DEBUG` environment variable to see detailed logs:

```bash
DEBUG=* npm run simulator
```

## Tech Stack

- **Runtime**: Node.js (>=18)
- **BLE Library**: `bleno` (or `@abandonware/bleno` on macOS)
- **Language**: JavaScript (ES Modules)

## Context for Agents

- When modifying BLE services, check `lib/` for specific service implementations (e.g., `CspService`, `RscService`, `FtmsService`).
- The project is designed to be cross-platform but has specific constraints on Windows (requires WinUSB driver).

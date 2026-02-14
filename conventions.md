# Coding Conventions

## Language & Syntax

- **JavaScript Version**: ES Modules (ESM) are used throughout the project (`import`/`export`).
- **Node.js**: The project targets Node.js >= 18.
- **Semicolons**: Always use semicolons.

## Naming Conventions

- **Variables & Functions**: logical camelCase (e.g., `notifyCSP`, `startAdvertising`).
- **Classes**: PascalCase (e.g., `ZwackBLE`, `CyclingPowerService`).
- **Files**: kebab-case (e.g., `zwack-ble-sensor.js`, `cycling-power-service.js`).
- **Constants**: UPPER_SNAKE_CASE for global constants.

## Formatting

- **Indentation**: 4 spaces (not tabs).
- **Braces**: K&R style (opening brace on the same line).

## Project Structure

- **`lib/`**: Contains the core logic and BLE service implementations.
- **`example/`**: Contains example usage scripts (e.g., `simulator.js`).

## Error Handling

- Use `try...catch` blocks where appropriate.
- For asynchronous operations, ensure errors are either handled or emitted via `EventEmitter` (e.g., `this.emit('error', err)`).
- `bleno` callbacks often return an `error` object; always check for it (e.g., `if (error) ...`).

## Logging

- Use the `debug` module for logging.
- Define namespaces clearly (e.g., `debug('ble')`, `debug('csp')`).

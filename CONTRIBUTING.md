# Contributing to Zwack

We welcome contributions to improve Zwack!

## creating a Pull Request

1. **Fork the repository**.
2. **Create a feature branch**: `git checkout -b feature/my-new-feature`.
3. **Commit your changes**: `git commit -am 'Add some feature'`.
4. **Push to the branch**: `git push origin feature/my-new-feature`.
5. **Submit a pull request**.

## Development Guidelines

- **Code Style**:
  - Use 4 spaces for indentation (based on existing files).
  - Use semicolons.
  - Follow conventions found in existing `lib/` files.

- **Testing**:
  - Since this is a hardware simulator, automated testing is difficult.
  - **Manual Verification**:
    - Run the simulator: `npm run simulator -- --variable=ftms --variable=rsc --variable=csp`
    - Connect using a BLE scanner app (e.g., nRF Connect, LightBlue) or a fitness app (Zwift, Rouvy).
    - Verify that the simulated sensor appears and data updates correctly when you change values (p/P, c/C, s/S).
  - If you add a new feature, please describe how to verify it in your PR description.

## Dependencies

- Ensure you do not introduce unnecessary dependencies.
- If modifying `bleno` related code, remember to test on multiple platforms if possible (macOS/Linux).

---
description: Modernize a stale Node.js project that can no longer run
---

# New Project Modernization Workflow

// turbo-all

Use this workflow when picking up an abandoned or stale Node.js project that needs to be brought back to life.

## Phase 1: Audit & Get It Running

1. **Examine the project**
   - Read `package.json`, `README.md`, and entry point files
   - Identify the main run script (e.g., `npm run simulator`, `npm start`)
   - Try running it and capture the error output

2. **Clean up `package.json`**
   - Remove npm registry metadata (`_from`, `_id`, `_integrity`, `_resolved`, etc.)
   - Add missing dependencies (check all `require()` / `import` calls)
   - Remove built-in modules from dependencies (e.g., `readline`, `util`, `events`)
   - Update aliased packages to direct references
   - Add `"engines"` field for minimum Node version
   - Bump the version number

3. **Fix deprecated APIs**
   - `new Buffer()` → `Buffer.alloc()` or `Buffer.from()`
   - `new Buffer.alloc()` → `Buffer.alloc()` (drop the `new`)
   - `buffer.slice()` → `buffer.subarray()`

4. **Install dependencies**

   ```bash
   rm -f package-lock.json
   npm install
   ```

   - If `node-gyp` fails, check for stale global installs (`~/node_modules/node-gyp`)

5. **Verify it runs**

   ```bash
   timeout 5 npm run <script> 2>&1 || true
   ```

## Phase 2: Modernize Code

1. **Convert to ESM**
   - Add `"type": "module"` to `package.json`
   - `require()` → `import`
   - `module.exports` → `export default`
   - Add `.js` extensions to all relative imports

2. **Update variable declarations**
   - `var` → `const` (default) or `let` (if reassigned)

3. **Clean up code quality**
   - Remove dead/commented-out code blocks
   - Replace `hasOwnProperty` calls with `Object.prototype.hasOwnProperty.call()`
   - Replace `let self = this` patterns with arrow functions
   - Simplify clamping: `if (x < 0) x = 0` → `x = Math.max(0, x)`

4. **Verify again**

   ```bash
   timeout 5 npm run <script> 2>&1 || true
   ```

# Agent Guidelines for SiYuan Picture Library Plugin

## Project Overview

This is a SiYuan Notes plugin that provides a gallery/picture library feature allowing users to manage images and videos within their SiYuan workspace. Built with Vue 3, Element Plus, and TypeScript.

## Build Commands

### Main Build Commands

```bash
npm run build        # Build the plugin for production
npm run dev          # Build in watch mode for development
```

### Alternative Package Managers

```bash
# Using pnpm (recommended)
pnpm build
pnpm dev

# Using yarn
yarn build
yarn dev
```

## Linting Commands

```bash
# ESLint for JavaScript/TypeScript files
npx eslint src/**/*.{js,ts,vue}

# Prettier for code formatting
npx prettier --check src/**/*
npx prettier --write src/**/*

# Combined lint and format
npm run lint          # if available
npx eslint src/**/*.{js,ts,vue} --fix
```

## Testing Commands

**Note**: This project does not appear to have a test suite configured. No test files or test commands are present in package.json.

```bash
# No standard test commands exist yet
# To add tests, configure Jest, Vitest, or Vue Test Utils
```

## Running Single Tests

**Not Applicable**: No test framework is currently configured in this project.

## Code Style Guidelines

### General Conventions

- **Language**: JavaScript/TypeScript with ES6+ features
- **Framework**: Vue 3 Composition API with `<script setup>`
- **UI Library**: Element Plus components
- **Build Tool**: Vite
- **Type System**: TypeScript (strict: false in tsconfig)

### Imports

- Import from explicit file extensions when needed
- Group imports logically: external libraries, then internal modules
- Use absolute paths with @ alias for src directory
- Order: Vue composables first, then libraries, then local modules
- Example:

```javascript
import { ref, computed, onMounted } from "vue";
import { Plugin } from "siyuan";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { Storage } from "./storage";
import { _ } from "./util/i18n";
import "./style.css";
```

### Formatting Standards

- Use consistent indentation (2 spaces for Vue templates, 2 spaces for JS/TS)
- Follow Prettier defaults (configured with single quotes, semi-colons, etc.)
- Line length: Max 120 characters
- Use consistent spacing around operators and properties
- Trailing commas where appropriate

### Naming Conventions

- **Components**: PascalCase (e.g., `Tab.vue`, `Dock.vue`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `TAB_TYPE`, `ICON`)
- **Variables/Functions**: camelCase (e.g., `addFolder`, `setting`)
- **Private methods**: Regular camelCase (no underscore prefix)
- **Vue Props**: camelCase
- **CSS Classes**: BEM methodology preferred (e.g., `sppl-dock`, `sppl-tree-node`)

### TypeScript Usage

- Use strict typing where beneficial
- Define interfaces for complex objects
- Use Vue's built-in typing helpers when available
- Follow Vue 3 Composition API typing patterns
- Use `F()` for Vue refs in TypeScript context

### Vue Component Structure

- Use `<script setup>` syntax
- Place template at top, followed by script
- Keep components focused and modular
- Use Element Plus component conventions
- Include proper prop definitions and type checking

### Error Handling

- Handle asynchronous operations with try/catch
- Use SiYuan's built-in notification systems
- Gracefully handle missing dependencies
- Log warnings appropriately for non-critical issues
- Example:

```javascript
try {
  const result = await someAsyncOperation();
} catch (error) {
  console.warn("Operation failed:", error);
  // Optionally notify user via SiYuan API
}
```

### SiYuan Plugin Specific Patterns

- Extend the `Plugin` class from 'siyuan'
- Implement `onload()` method for initialization
- Use SiYuan's event bus for communication
- Follow SiYuan's plugin lifecycle methods
- Implement proper cleanup in `onunload()` if needed
- Use SiYuan's internationalization patterns

### Internationalization (i18n)

- Use `_()` function for translations
- Store translations in i18n files
- Use SiYuan's i18n system for plugin compatibility

### File Organization

- `src/index.js`: Main plugin entry point
- `src/components/`: Vue components
- `src/storage/`: Data persistence logic
- `src/util/`: Utility functions
- `src/assets/`: Static assets
- Keep related functionality grouped in subdirectories

### Performance Considerations

- Use Vue's reactivity system efficiently
- Implement proper caching strategies
- Lazy load heavy components when possible
- Use virtual scrolling for large lists
- Minimize unnecessary re-renders

### Security Practices

- Validate and sanitize user inputs
- Sanitize file paths when accessing the file system
- Follow SiYuan's security guidelines
- Avoid eval() or similar unsafe operations
- Be cautious with file system operations

### Git Workflow

- Follow conventional commits where possible
- Keep changes atomic and focused
- Update version in plugin.json when releasing
- Include meaningful commit messages
- Branch naming: feature/feature-name, bugfix/issue-description

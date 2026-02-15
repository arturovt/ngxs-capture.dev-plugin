# ngxs-capture.dev-plugin

NGXS plugin for [LogRocket](https://logrocket.com/) that augments LogRocket sessions with actions and state from your NGXS store.

[![npm version](https://badge.fury.io/js/ngxs-capture.dev-plugin.svg)](https://www.npmjs.com/package/ngxs-capture.dev-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![LogRocket Redux Tab](https://raw.githubusercontent.com/arturovt/ngxs-capture.dev-plugin/refs/heads/main/docs/assets/screenshot.png)

## Features

- **Complete Action Logging** - Captures all NGXS actions with their status (Dispatched, Successful, Errored, Canceled)
- **State Snapshots** - Records state before and after each action
- **Optimized Performance** - Runs outside Angular zone to prevent unnecessary change detection
- **Privacy Controls** - Sanitize sensitive data from actions and state
- **Flexible Integration** - Load LogRocket from npm package or CDN script tag
- **SSR Compatible** - Safely skips logging during server-side rendering

## Installation

```bash
npm install ngxs-capture.dev-plugin logrocket
```

Or with yarn:

```bash
yarn add ngxs-capture.dev-plugin logrocket
```

Or with pnpm:

```bash
pnpm add ngxs-capture.dev-plugin logrocket
```

## Requirements

- `@ngxs/store` >= 21.0.0
- `logrocket` (peer dependency)
- Angular (compatible with your NGXS version)

## Usage

### Basic Setup

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngxs/store';
import { withNgxsLogRocketReduxMiddlewarePlugin } from 'ngxs-capture.dev-plugin';
import LogRocket from 'logrocket';

// Initialize LogRocket
LogRocket.init('your-app-id');

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [
        /* your states */
      ],
      withNgxsLogRocketReduxMiddlewarePlugin({
        logrocket: () => LogRocket,
      }),
    ),
  ],
};
```

### Loading LogRocket from CDN

If you load LogRocket via a script tag instead of npm:

```html
<!-- index.html -->
<script src="https://cdn.logr-in.com/LogRocket.min.js" crossorigin="anonymous"></script>
<script>
  window.LogRocket && window.LogRocket.init('your-app-id');
</script>
```

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [
        /* your states */
      ],
      withNgxsLogRocketReduxMiddlewarePlugin({
        logrocket: () => window.LogRocket,
      }),
    ),
  ],
};
```

## Configuration

### Sanitizing Actions

Remove sensitive data from actions before logging:

```typescript
withNgxsLogRocketReduxMiddlewarePlugin({
  logrocket: () => LogRocket,
  actionSanitizer: (action) => {
    // Ignore specific actions
    if (action.type === '[Auth] Login Success') {
      return null; // Action won't be logged
    }

    // Redact sensitive data
    if (action.type === '[User] Update Profile') {
      return {
        ...action,
        password: undefined,
        creditCard: undefined,
      };
    }

    return action;
  },
});
```

### Sanitizing State

Remove sensitive data from state snapshots:

```typescript
withNgxsLogRocketReduxMiddlewarePlugin({
  logrocket: () => LogRocket,
  stateSanitizer: (state) => {
    return {
      ...state,
      auth: {
        ...state.auth,
        token: undefined, // Remove auth token
        password: undefined,
      },
      payment: undefined, // Remove entire payment state
    };
  },
});
```

### Using Angular Injection in Sanitizers

Both `logrocket`, `stateSanitizer`, and `actionSanitizer` run in injection context, allowing you to use Angular's `inject()`:

```typescript
import { inject } from '@angular/core';
import { MySecurityService } from './my-security.service';

withNgxsLogRocketReduxMiddlewarePlugin({
  logrocket: () => LogRocket,
  stateSanitizer: (state) => {
    const security = inject(MySecurityService);
    return security.sanitizeState(state);
  },
  actionSanitizer: (action) => {
    const security = inject(MySecurityService);
    return security.shouldLogAction(action) ? action : null;
  },
});
```

## Action Status Types

The plugin logs actions with the following statuses:

| Status       | Description                                            |
| ------------ | ------------------------------------------------------ |
| `DISPATCHED` | Action has been dispatched                             |
| `SUCCESSFUL` | Action handler completed successfully                  |
| `ERRORED`    | Action handler threw an error                          |
| `CANCELED`   | Action was canceled by another action of the same type |

Example in LogRocket:

```
[Countries] Load countries (DISPATCHED)
[Countries] Load countries (SUCCESSFUL)
[Auth] Login (DISPATCHED)
[Auth] Login (ERRORED)
```

## How It Works

The plugin integrates with NGXS as a middleware and leverages LogRocket's Redux middleware under the hood:

1. Intercepts all NGXS actions before they're processed
2. Logs action dispatch with current state
3. Captures action completion (success, error, or cancellation)
4. Compresses actions and state using LogRocket's binary format
5. Performs state diffs to minimize network data

All logging operations run outside the Angular zone to prevent triggering unnecessary change detection cycles.

## Viewing Logs in LogRocket

Once configured, you can view NGXS actions in the LogRocket dashboard:

1. Open a session in LogRocket
2. Navigate to the "Redux" tab
3. Browse actions and state changes
4. Click an action to see state before and after

## Performance Considerations

- **Zone Optimization**: All LogRocket operations run outside Angular's zone
- **Data Compression**: Actions and state are compressed using binary format
- **State Diffing**: Only state changes are transmitted, not full snapshots
- **Error Handling**: LogRocket errors are caught and logged without breaking your app
- **SSR Safe**: Automatically skips logging on server to prevent errors

## TypeScript Support

Full TypeScript support is included. The plugin exports all necessary types:

```typescript
import type { NgxsLogRocketReduxMiddlewareOptions } from 'ngxs-capture.dev-plugin';
```

## Troubleshooting

### Actions Not Appearing in LogRocket

1. Verify LogRocket is initialized before NGXS
2. Check that the plugin is registered with `provideStore`
3. Ensure you're not returning `null` from `actionSanitizer`

### Performance Issues

- Use `actionSanitizer` to filter high-frequency actions
- Sanitize large state objects to reduce payload size
- Verify you're using the factory pattern `() => LogRocket` (not direct reference)

## License

MIT © [arturovt](https://github.com/arturovt)

## Related Projects

- [logrocket](https://www.npmjs.com/package/logrocket) - LogRocket JavaScript SDK
- [@ngxs/store](https://www.npmjs.com/package/@ngxs/store) - NGXS State Management
- [logrocket-ngrx](https://www.npmjs.com/package/logrocket-ngrx) - NgRx middleware for LogRocket

## Version Compatibility

This package follows the major version of `@ngxs/store`:

| ngxs-capture.dev-plugin | @ngxs/store |
| --------------------- | ----------- |
| 21.x.x                | >=21.0.0    |

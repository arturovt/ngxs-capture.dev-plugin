import { withNgxsPlugin } from '@ngxs/store';

import { ɵNgxsCaptureDevReduxMiddlewarePlugin } from './capture.dev-redux-middleware.plugin';

export function withNgxsCaptureDevReduxMiddlewarePlugin() {
  return withNgxsPlugin(ɵNgxsCaptureDevReduxMiddlewarePlugin);
}

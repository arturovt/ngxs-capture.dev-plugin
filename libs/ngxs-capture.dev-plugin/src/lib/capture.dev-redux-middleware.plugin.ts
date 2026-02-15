import {
  inject,
  Injectable,
  Injector,
  NgZone,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { captureReduxMiddleware } from '@capture.dev/redux';
import {
  ActionStatus,
  getActionTypeFromInstance,
  Store,
  type NgxsNextPluginFn,
  type NgxsPlugin,
} from '@ngxs/store';
import { tap } from 'rxjs';

@Injectable()
export class ɵNgxsCaptureDevReduxMiddlewarePlugin implements NgxsPlugin {
  private readonly _ngZone = inject(NgZone);
  private readonly _injector = inject(Injector);
  private readonly _isServer =
    (typeof ngServerMode !== 'undefined' && ngServerMode) ||
    isPlatformServer(inject(PLATFORM_ID));

  private _store!: Store;
  private _captureDevStore!: (newState: any) => (newAction: any) => void;

  handle(state: any, action: any, next: NgxsNextPluginFn) {
    // The `next(...)` observable will:
    // * emit `next` then complete when action completes successfully
    // * emit `error` (not `next` or `complete`) when @Action handler throws
    // * emit only `complete` (not `next`) when action is cancelled by same type
    const result = next(state, action);

    // Log dispatched action immediately (synchronous actions already handled after `next()` call)
    this._logReduxEvent(null, action, ActionStatus.Dispatched);

    let hasBeenCancelled = true;

    return result.pipe(
      tap({
        next: (newState) => {
          hasBeenCancelled = false;
          this._logReduxEvent(newState, action, ActionStatus.Successful);
        },
        error: () => {
          this._logReduxEvent(null, action, ActionStatus.Errored);
        },
        complete: () => {
          if (hasBeenCancelled) {
            this._logReduxEvent(null, action, ActionStatus.Canceled);
          }
        },
      }),
    );
  }

  private _logReduxEvent(
    newState: any,
    action: any,
    status: ActionStatus,
  ): void {
    // Capture.dev only runs in the browser, skip logging during SSR.
    if (this._isServer) {
      return;
    }

    if (this._captureDevStore == null) {
      // Retrieve lazily to avoid any cyclic dependency injection errors.
      this._store = this._injector.get(Store);

      this._captureDevStore = this._ngZone.runOutsideAngular(() => {
        return captureReduxMiddleware({
          getState: () => this._store.snapshot(),
        });
      });
    }

    newState = newState || this._store.snapshot();
    const newAction = {
      type: `${getActionTypeFromInstance(action)} (${status})`,
      payload: action.payload || { ...action },
    };
    // Run outside Angular zone to prevent unnecessary change detection cycles.
    // Capture.dev internally queues events and may trigger async operations.
    this._ngZone.runOutsideAngular(() => {
      try {
        // Call Capture middleware: `(next) => (action) => result`
        // We pass a dummy next that returns the state, then invoke with formatted action.
        this._captureDevStore(() => newState)(newAction);
      } catch (error) {
        // Swallow errors from Capture.dev to prevent breaking app flow.
        console.error(error);
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { tap, timer } from 'rxjs';

export class IncrementSync {
  static readonly type = '[Counter] Increment Sync';
}

export class IncrementAsync {
  static readonly type = '[Counter] Increment Async';
}

@State({
  name: 'counter',
  defaults: 0,
})
@Injectable()
export class CounterState {
  @Action(IncrementSync)
  incrementSync(ctx: StateContext<number>) {
    ctx.setState((counter) => counter + 1);
  }

  @Action(IncrementAsync, { cancelUncompleted: true })
  incrementAsync(ctx: StateContext<number>) {
    return timer(1000).pipe(
      tap(() => {
        ctx.setState((counter) => counter + 1);
      }),
    );
  }
}

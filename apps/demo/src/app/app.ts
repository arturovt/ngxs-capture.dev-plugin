import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';

import { IncrementAsync, IncrementSync } from './counter.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly _store = inject(Store);

  incrementSync() {
    this._store.dispatch(new IncrementSync());
  }

  incrementAsync() {
    this._store.dispatch(new IncrementAsync());
  }
}

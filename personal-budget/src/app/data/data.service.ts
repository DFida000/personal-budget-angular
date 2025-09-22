import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BudgetItem {
  title: string;
  budget: number;
}
export interface BudgetData {
  labels: string[];
  values: number[];
  colors: string[];
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  private readonly _data$ = new BehaviorSubject<BudgetData | null>(null);

  readonly data$ = this._data$.asObservable();

  load(): void {
    if (this._data$.value) {
      return;
    }

    this.http
      .get<{ myBudget: BudgetItem[] }>('http://localhost:3000/budget')
      .pipe(
        map((res) => {
          const items = res?.myBudget ?? [];
          return {
            labels: items.map((x) => x.title),
            values: items.map((x) => Number(x.budget) || 0),
            colors: [
              '#ffcd56',
              '#ff6384',
              '#36a2eb',
              '#fd6b19',
              '#4bc0c0',
              '#9966ff',
              '#c9cbcf',
              '#f67019',
            ],
          } as BudgetData;
        }),
      )
      .subscribe((data) => this._data$.next(data));
  }
}

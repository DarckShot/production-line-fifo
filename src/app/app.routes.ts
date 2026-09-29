import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/production-line/production-line/production-line').then(
        (module) => module.ProductionLine,
      ),
  },
];

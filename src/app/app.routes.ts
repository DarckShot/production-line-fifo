import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/production-line/production-line').then(
        (module) => module.ProductionLine,
      ),
  },
];

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';



const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'dashboard',
      loadChildren: () => import ('./dashboard/dashboard.module').then(m => m.DashboardModule),
    },
    {
      path: 'sales-points',
      loadChildren: () => import ('./sales-points/sales-points.module').
      then(m => m.SalesPointsModule),
    },
    {
      path: 'table-of-content',
      loadChildren: () => import ('./table-of-content/table-of-content.module').
      then(m => m.TableOfContentModule),
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}

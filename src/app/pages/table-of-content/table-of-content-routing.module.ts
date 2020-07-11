import { NgModule } from '@angular/core';

import { NotFoundComponent } from '../miscellaneous/not-found/not-found.component';
import { Routes, RouterModule } from '@angular/router';
import { ListContentComponent } from './table-of-content-dashboard/list-content/list-content.component';
import { TableOfContentComponent } from './table-of-content.component';
import { TableOfContentDashboardComponent } from './table-of-content-dashboard/table-of-content-dashboard.component';


const routes: Routes = [{
  path: '',
  component: TableOfContentComponent,
  children: [
    {
      path: 'dash',
      component: TableOfContentDashboardComponent
    },
    {
      path: 'add-component',
      component: TableOfContentDashboardComponent
    },
    {
      path: '**',
      redirectTo: 'dash'
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class TableOfContentRoutingModule {

}

import { NgModule } from '@angular/core';

import { NotFoundComponent } from '../miscellaneous/not-found/not-found.component';
import { Routes, RouterModule } from '@angular/router';
import { ListContentComponent } from './table-of-content-dashboard/list-content/list-content.component';


const routes: Routes = [{
  path: '',
  component: ListContentComponent,
  children: [
    {
      path: 'content-list',
      component: ListContentComponent
    },
    {
      path: '',
      redirectTo: 'map',
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

export class TableOfContentRoutingModule {

}

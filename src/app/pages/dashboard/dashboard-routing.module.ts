import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { NotFoundComponent } from '../miscellaneous/not-found/not-found.component';



const routes: Routes = [{
  path: '',
  component: DashboardComponent,
  children: [

    {
      path: '',
      redirectTo: '',
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

export class DashboardRoutingModule {
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from '../miscellaneous/not-found/not-found.component';
import { SalesPointsComponent } from './sales-points.component';
import { SpMapComponent } from './sp-map/sp-map.component';



const routes: Routes = [{
  path: '',
  component: SalesPointsComponent,
  children: [
    {
      path: 'map',
      component: SpMapComponent,
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
export class SalesPointsRoutingModule {

}

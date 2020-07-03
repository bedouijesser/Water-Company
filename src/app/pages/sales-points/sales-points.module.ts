import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { NbCardModule, NbStepperModule, NbUserModule, NbButtonModule, NbIconModule, NbTabsetModule, NbSelectModule, NbListModule, NbInputModule, NbProgressBarModule, NbRadioModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { BidiModule } from '@angular/cdk/bidi';
import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { SalesPointsComponent } from './sales-points.component';
import { SpMapComponent } from './sp-map/sp-map.component';
import { SalesPointsRoutingModule } from './sales-points-routing.module';
const MATERIAL_MODULES = [
  OverlayModule,
  PortalModule,
  BidiModule,
  A11yModule,
  ObserversModule
  ];

@NgModule({
  imports: [
    ThemeModule,
    NbCardModule,
    NbStepperModule,
    NbUserModule,
    NbButtonModule,
    NbIconModule,
    NbTabsetModule,
    NbSelectModule,
    NbListModule,
    NbInputModule,
    NbProgressBarModule,
    MATERIAL_MODULES,
    FormsModule,
    ReactiveFormsModule,
    NbRadioModule,
    SalesPointsRoutingModule
  ],
  declarations: [
    SalesPointsComponent,
    SpMapComponent
  ]
})


export class SalesPointsModule {

}

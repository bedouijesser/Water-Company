import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { NbCardModule, NbStepperModule, NbUserModule, NbButtonModule, NbIconModule, NbTabsetModule, NbSelectModule, NbListModule, NbInputModule, NbProgressBarModule, NbRadioModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { BidiModule } from '@angular/cdk/bidi';
import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { TrafficCardComponent } from './traffic-reveal-card/traffic-card.component';


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
    DashboardRoutingModule
  ],
  declarations:[
    DashboardComponent,
    TrafficCardComponent
  ]
})
export class DashboardModule {

}

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
import { TrafficBarChartComponent } from './traffic-reveal-card/back-side/traffic-bar-chart.component';
import { TrafficBackCardComponent } from './traffic-reveal-card/back-side/traffic-back-card.component';
import { TrafficFrontCardComponent } from './traffic-reveal-card/front-side/traffic-front-card.component';
import { TrafficBarComponent } from './traffic-reveal-card/front-side/traffic-bar/traffic-bar.component';
import { TrafficRevealCardComponent } from './traffic-reveal-card/traffic-reveal-card.component';
import { TrafficCardsHeaderComponent } from './traffic-reveal-card/traffic-cards-header/traffic-cards-header.component';

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
    TrafficBarChartComponent,
    TrafficBackCardComponent,
    TrafficFrontCardComponent,
    TrafficBarComponent,
    TrafficRevealCardComponent,
    TrafficCardsHeaderComponent
  ]
})
export class DashboardModule {

}

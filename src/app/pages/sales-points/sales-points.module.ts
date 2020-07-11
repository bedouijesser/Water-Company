import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { NbCardModule, NbStepperModule, NbUserModule, NbButtonModule, NbIconModule, NbTabsetModule, NbSelectModule, NbListModule, NbInputModule, NbProgressBarModule, NbRadioModule, NbCalendarRangeModule, NbBaseCalendarModule, NbCalendarViewMode, NbCalendarModule, NbCalendarKitModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { SalesPointsComponent } from './sales-points.component';
import { SpMapComponent } from './sp-map/sp-map.component';
import { SalesPointsRoutingModule } from './sales-points-routing.module';
import { SpMapDetailsComponent } from './sp-map/sp-map-details/sp-map-details.component';
import { BidiModule } from '@angular/cdk/bidi';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule, MatSidenavModule, MatSortModule, MatTabsModule, MatToolbarModule, MatTooltipModule } from '@angular/material';

const MATERIAL_MODULES = [
  OverlayModule,
  PortalModule,
  BidiModule,
  A11yModule,
  ObserversModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatTableModule,
  MatAutocompleteModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSortModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  ];

@NgModule({
  imports: [
    ThemeModule,
    NbCardModule,
    NbStepperModule,
    NbUserModule,
    NbButtonModule,
    NbIconModule,
    NbCalendarRangeModule,
    NbBaseCalendarModule,
    NbCalendarModule,
    NbCalendarKitModule,
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
    SpMapComponent,
    SpMapDetailsComponent
  ]
})


export class SalesPointsModule {

}

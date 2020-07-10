import { NgModule } from '@angular/core';
import { TableOfContentComponent } from './table-of-content.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { BidiModule } from '@angular/cdk/bidi';
import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { ThemeModule } from '../../@theme/theme.module';
import { NbCardModule, NbStepperModule, NbUserModule, NbButtonModule, NbIconModule, NbTabsetModule, NbSelectModule, NbListModule, NbInputModule, NbProgressBarModule, NbRadioModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableOfContentRoutingModule } from './table-of-content-routing.module';
import { ShowContentComponent } from './table-of-content-dashboard/show-content/show-content.component';
import { ListContentComponent } from './table-of-content-dashboard/list-content/list-content.component';
import { TableOfContentDashboardComponent } from './table-of-content-dashboard/table-of-content-dashboard.component';
import { MatNativeDateModule, MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatChipsModule, MatCheckboxModule, MatDatepickerModule, MatTableModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatPaginatorModule, MatRippleModule, MatSortModule, MatStepperModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatGridListModule, MatInputModule, MatListModule, MatMenuModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule, MatSidenavModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule } from '@angular/material';


  const MATERIAL_MODULES = [
    OverlayModule,
    PortalModule,
    BidiModule,
    A11yModule,
    ObserversModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatTableModule,
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
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
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
      NbTabsetModule,
      NbSelectModule,
      NbListModule,
      NbInputModule,
      NbProgressBarModule,
      MATERIAL_MODULES,
      FormsModule,
      ReactiveFormsModule,
      NbRadioModule,
      TableOfContentRoutingModule

    ],
    declarations: [
      TableOfContentComponent,
      ShowContentComponent,
      ListContentComponent,
      TableOfContentDashboardComponent,

    ]
  })
export class TableOfContentModule {}

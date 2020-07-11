import { NgModule } from '@angular/core';
import { TableOfContentComponent } from './table-of-content.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { ObserversModule } from '@angular/cdk/observers';
import { ThemeModule } from '../../@theme/theme.module';
import { NbCardModule, NbStepperModule, NbUserModule, NbButtonModule, NbIconModule, NbTabsetModule, NbSelectModule, NbListModule, NbInputModule, NbProgressBarModule, NbRadioModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableOfContentRoutingModule } from './table-of-content-routing.module';
import { ShowContentComponent } from './table-of-content-dashboard/show-content/show-content.component';
import { ListContentComponent } from './table-of-content-dashboard/list-content/list-content.component';
import { TableOfContentDashboardComponent } from './table-of-content-dashboard/table-of-content-dashboard.component';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule, MatIconModule, MatInputModule, MatTabsModule } from '@angular/material';

import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatToolbarModule } from '@angular/material/toolbar';
import { BidiModule } from '@angular/cdk/bidi';
import { MatDialogModule } from '@angular/material/dialog';


  const MATERIAL_MODULES = [
    OverlayModule,
    PortalModule,
    BidiModule,
    ObserversModule,
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
      NbButtonModule,
      NbStepperModule,
      NbUserModule,
      NbIconModule,
      NbTabsetModule,
      NbSelectModule,
      NbListModule,
      NbInputModule,
      NbProgressBarModule,
      FormsModule,
      ReactiveFormsModule,
      MATERIAL_MODULES,
      FormsModule,
      ReactiveFormsModule,
      NbRadioModule,
      TableOfContentRoutingModule,

    ],
    declarations: [
      TableOfContentComponent,
      ShowContentComponent,
      ListContentComponent,
      TableOfContentDashboardComponent,

    ],
  })
export class TableOfContentModule {}

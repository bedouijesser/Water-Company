import { Component, OnInit } from '@angular/core';
import { TableOfContentService } from './table-of-content-dash.service';
import { MatDialog } from '@angular/material';
import { ShowContentComponent } from './show-content/show-content.component';

@Component({
  templateUrl: './table-of-content-dashboard.component.html',
})
export class TableOfContentDashboardComponent implements OnInit{
  showContentClicked = false;
  constructor(private tocService: TableOfContentService,
              private dialog: MatDialog) { }

  ngOnInit(): void {

    this.tocService.reloadTOCList.next(true);
    this.tocService.showContentRef.subscribe(isClicked => {
      this.showContentClicked = isClicked;
      if (isClicked) this.openDialog();
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ShowContentComponent, {
      width: '75vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }



}

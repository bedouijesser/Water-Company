import { Component, OnInit } from '@angular/core';
import { TableOfContentService } from './table-of-content-dash.service';

@Component({
  templateUrl: './table-of-content-dashboard.component.html',
})
export class TableOfContentDashboardComponent implements OnInit{
  showContentClicked = false;
  constructor(private tocService: TableOfContentService) { }

  ngOnInit(): void {
    this.tocService.reloadTOCList.next(true);
    this.tocService.showContentRef.subscribe(isClicked => {
      this.showContentClicked = isClicked;
    });
  }


}

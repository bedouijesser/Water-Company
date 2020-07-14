import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { TableOfContentService } from '../table-of-content-dash.service';
import { MatTableDataSource } from '@angular/material';

export interface ProductElement {
  criteria: string;
  value: any;
}
@Component({
  selector: 'ngx-show-content',
  templateUrl: './show-content.component.html',
  styleUrls: ['./show-content.component.scss'],
})
export class ShowContentComponent implements OnInit,OnDestroy {

  productData: ProductElement[]= []
  dataObj = null;
  displayedColumns: string[] = ['criteria', 'value'];
  dataSource;
  demoReservedValue = Math.floor(Math.random() * 200);
  constructor(private tocService: TableOfContentService) { }

  ngOnInit() {
    this.dataObj = this.tocService.getShowContentData();
    for(let criteria in this.dataObj) {
      this.productData.push({criteria: criteria,value: this.dataObj[criteria]})
    }

    this.productData.push({criteria: 'Reserved Stock',value: this.demoReservedValue })
    this.productData.push({criteria: 'Actual Stock',value: this.demoReservedValue + this.dataObj.Quantity })
    this.dataSource = new MatTableDataSource(this.productData);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  hide(){
    this.tocService.hideContent();
    this.dataObj = null;
  }

  ngOnDestroy(){
    this.tocService.hideContent();
    this.dataObj = null;
  }

}

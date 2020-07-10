import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material';
import { TableOfContentService } from '../../table-of-content.service';

export interface UserData {
  productRef: number;
  productStatus: string;
  productName: string;
  product: string;
}
@Component({
  selector: 'ngx-list-content',
  templateUrl: './list-content.component.html',
  styleUrls: ['./list-content.component.scss']
})
export class ListContentComponent implements OnInit {


  public rfqList: any[] = [];
  private activatedReloadRfqList: Subscription;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private tocService: TableOfContentService,
    private router: Router) {

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.rfqList);

  }
  ngOnInit() {
    this.activatedReloadRfqList = this.tocService.reloadTOCList.subscribe(reload => {
      if (reload) {
        this.reloadList();
      }

    });
    this.reloadList();
  }
  reloadList() {

        this.rfqList
        // Assign the data to the data source for the table to render
        this.dataSource = new MatTableDataSource(this.rfqList);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

  }


  /***********************************************************
   * Table Configuration
   */
  displayedColumns: string[] = ['ref', 'status', 'name','category'];
  dataSource: MatTableDataSource < UserData > ;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  addContent(){

  }
  showContent(){

  }

}

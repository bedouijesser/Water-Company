import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TableOfContentService } from '../table-of-content-dash.service';
import { MatTableDataSource } from '@angular/material/table';

export interface UserData {
  Reference: string;
  Status: string;
  Product_name: string;
  Category: string;
  Quantity: number;
}
@Component({
  selector: 'ngx-list-content',
  templateUrl: './list-content.component.html',
  styleUrls: ['./list-content.component.scss'],
})
export class ListContentComponent implements OnInit {


  public productList = [
    {
      'Reference' : '1',
      'Status': 'Available',
      'Product_name': 'Maroua',
      'Category': '1L',
      'Quantity': 580,
    },
    {
      'Reference' : '2',
      'Status': 'Available',
      'Product_name': 'Maroua',
      'Category': '1,5L',
      'Quantity': 463,
    },
    {
      'Reference' : '3',
      'Status': 'Unavailable',
      'Product_name': 'Milliti',
      'Category': '1L',
      'Quantity': 0,
    },
    {
      'Reference' : '4',
      'Status': 'Available',
      'Product_name': 'Milliti',
      'Category': '1,5L',
      'Quantity': 255,
    },
  ];
  private activatedReloadRfqList: Subscription;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private tocService: TableOfContentService,
    private router: Router) {

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.productList);

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

        // Assign the data to the data source for the table to render
        this.dataSource = new MatTableDataSource(this.productList);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

  }

  /***********************************************************
   * Table Configuration
   */
  displayedColumns: string[] = ['ref', 'status', 'name', 'category', 'quantity'];
  dataSource: MatTableDataSource <UserData> ;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  addContent(){

  }
  showContent(row){
    console.log(row);
    this.tocService.showContent(row);
  }

}

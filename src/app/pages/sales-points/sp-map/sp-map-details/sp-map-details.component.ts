import {SelectionModel} from '@angular/cdk/collections';
import {  MatTableDataSource  } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { SPMapService } from '../sp-map.service';

export interface UserData {
  Reference: string;
  Status: string;
  Product_name: string;
  Category: string;
  Quantity: number
}
@Component({
  selector: 'ngx-sp-map-details',
  templateUrl: './sp-map-details.component.html',
  styleUrls: ['./sp-map-details.component.scss']
})

export class SpMapDetailsComponent implements OnInit {
  date: Date;
  markerInfo;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private spMapService: SPMapService) { }

  ngOnInit() {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.productList);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.markerInfo = this.spMapService.markerInfo
  }
  handleDateChange(event){
    console.log(event)
  }

  productList = [
    {
      'Reference' : '1',
      'Status': 'Available',
      'Product_name': 'Maroua',
      'Category': '1L',
      'Quantity': Math.floor(Math.random()*1000),
    },
    {
      'Reference' : '2',
      'Status': 'Available',
      'Product_name': 'Maroua',
      'Category': '1,5L',
      'Quantity': Math.floor(Math.random()*1000),
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
      'Quantity': Math.floor(Math.random()*1000),
    },
  ];




  displayedColumns: string[] = ['ref', 'status', 'name','category','quantity'];
  dataSource: MatTableDataSource <UserData> ;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  showContent(){

  }
  ngOnDestroy() {
    this.markerInfo = null;
  }

}



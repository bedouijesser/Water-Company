import {  MatTableDataSource  } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { SPMapService } from '../sp-map.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

export interface UserData {
  Reference: string;
  Status: string;
  Product_name: string;
  Category: string;
  Quantity: number;
}
@Component({
  selector: 'ngx-sp-map-details',
  templateUrl: './sp-map-details.component.html',
  styleUrls: ['./sp-map-details.component.scss'],
})

export class SpMapDetailsComponent implements OnInit {
  markerInfo;
  newMarker:boolean = false;
  newMarkerCoordonates: string[] = [];
  form: FormGroup;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private spMapService: SPMapService,
    private fb: FormBuilder,
    private toastr:ToastrService,
    ) { }

  ngOnInit() {
    this.formInit();
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.productList);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.markerInfo = this.spMapService.markerInfo;
    this.spMapService.markerSelected.subscribe(() => {
      this.markerInfo = this.spMapService.markerInfo;

    });
    this.spMapService.addMarkerSelected.subscribe(value => {
      this.newMarker = value;
      console.log('marker selected:', value, this.newMarker);
    })
    this.spMapService.coordonatesSubject.subscribe(value => {
      this.newMarkerCoordonates = value
      this.form.patchValue({
        coordonates: value.join(' , ')
      })
    })
  }

  formInit() {
    this.form=this.fb.group({
      name:[null,Validators.required],
      manager:[null,Validators.required],
      email:[null,Validators.required],
      tel:[null,Validators.required],
      fax:[null,Validators.required],
      coordonates:[null,Validators.required],
    });
  }

  productList = [
    {
      'Reference' : '1',
      'Status': 'Sent',
      'Product_name': 'Maroua',
      'Category': '1L',
      'Quantity': 50,
    },
    {
      'Reference' : '2',
      'Status': 'Holding',
      'Product_name': 'Maroua',
      'Category': '1,5L',
      'Quantity': 40,
    },
    {
      'Reference' : '3',
      'Status': 'Sent',
      'Product_name': 'Safita',
      'Category': '2L',
      'Quantity': 100,
    },
    {
      'Reference' : '4',
      'Status': 'Canceled',
      'Product_name': 'Milliti',
      'Category': '1,5L',
      'Quantity': 30,
    },
  ];



  displayedColumns: string[] = ['ref', 'status', 'name', 'category', 'quantity'];
  dataSource: MatTableDataSource <UserData> ;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  // Keeps the hover effect in the table, too lazy to remove it
  showContent(){}

  addMarker(){
    this.toastr.success("Supplier Quotation Created Successefully !");
    this.spMapService.addSPMarker(this.form.value);
    this.form.reset();
  }
  ngOnDestroy() {
    this.markerInfo = null;
  }

}



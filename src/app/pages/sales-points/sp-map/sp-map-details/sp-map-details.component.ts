import {  MatTableDataSource  } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { SPMapService } from '../sp-map.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../../services/data.service';

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
    private dataService: DataService,
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
      // console.log('marker selected:', value, this.newMarker);
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
      email:[null,[Validators.required,Validators.email]],
      tel:[null,[Validators.required,Validators.pattern("[0-9]{8}")]],
      fax:[null,[Validators.required,Validators.pattern("[0-9]{8}")]],
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
    this.toastr.success("Marker Added Successefully !");
    // use getRawValue() instead of value to get the disabled coordenations input value
    let feature = {
      'type': 'Feature',
      'properties': {
        'title': this.form.getRawValue().name,
        'description': this.form.getRawValue().name,
        'manager': this.form.getRawValue().manager,
        'iconSize': [80, 80],
        'type': 'Sales-Point',
        'email': this.form.getRawValue().email,
        'fax': this.form.getRawValue().fax,
        'tel': this.form.getRawValue().tel
      },
      'geometry': {
        'type': 'Point',
        'coordinates': this.form.getRawValue().coordonates.split(',').map(x=>Number(x)),
      }
    }
    this.dataService.addMarker(feature).subscribe(()=> {
      this.spMapService.addSPMarker(feature)
      this.form.reset();
    })
  }
  ngOnDestroy() {
    this.markerInfo = null;
  }

}



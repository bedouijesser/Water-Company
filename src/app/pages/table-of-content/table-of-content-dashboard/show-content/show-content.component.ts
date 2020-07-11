import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-show-content',
  templateUrl: './show-content.component.html',
  styleUrls: ['./show-content.component.scss'],
})
export class ShowContentComponent implements OnInit {


  private showSuppQuotActive: Object = {};
  private dataObj: Object = {};
  showTOCRef = new Subject<boolean>();
  reloadTOCList = new Subject<boolean>();
  addQuotationRef: {
    RFQ_ID: String,
    RFQ_Reference: String,
  };
  constructor() { }

  ngOnInit(): void {
  }

}

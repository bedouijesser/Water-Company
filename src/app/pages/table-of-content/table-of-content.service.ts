import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableOfContentService {



  private showContentActive:Object = {};
  private dataObj:Object = {};
  showContentRef = new Subject<boolean>();
  reloadContentList = new Subject<boolean>();
  addQuotationRef : {
    RFQ_ID: String,
    RFQ_Reference: String
  };

  getShowContentRef(): any {
    return this.showContentRef;
  }
  getShowContentData(): any {
    return this.dataObj
  }

  showContent(rfqElm, dataObj) {
    this.showContentActive=rfqElm;
    this.dataObj = dataObj;
    // console.log(rfqElm.RFQ_ID);

    this.showContentRef.next(true);

  }

  showQuot(rfqElm,dataObj){
    this.showContentActive=rfqElm;
    this.dataObj = dataObj;
    // console.log(rfqElm.RFQ_ID);

    this.showContentRef.next(true);

  }
  showList(){
    this.showContentActive = null;
    this.showContentRef.next(true);
  }
  addSupplierQuotation(ref){
    this.addQuotationRef = ref;
  }

}

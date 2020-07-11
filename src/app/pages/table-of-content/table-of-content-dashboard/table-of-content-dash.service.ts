import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableOfContentService {
  getTOCRefList(arg0: number) {
    throw new Error("Method not implemented.");
  }

  private showContentActive:Object = {};
  private dataObj:Object = {};
  showContentRef = new Subject<boolean>();
  reloadTOCList = new Subject<boolean>();

  getShowContentRef(): any {
    return this.showContentRef;
  }
  getShowContentData(): any {
    return this.dataObj
  }

  showContent(prodInfo) {
    this.showContentActive=prodInfo;
    this.showContentRef.next(true);
  }

  showList(){
    this.showContentActive = null;
    this.showContentRef.next(true);
  }


}

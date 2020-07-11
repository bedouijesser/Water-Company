import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TableOfContentService {

  private dataObj: Object = {};
  showContentRef = new Subject<boolean>();
  reloadTOCList = new Subject<boolean>();

  getShowContentRef(): any {
    return this.showContentRef;
  }
  getShowContentData(): any {
    return this.dataObj;
  }

  showContent(prodInfo) {
    this.showContentRef.next(true);
    this.dataObj = prodInfo;
  }

  showList(){
    this.showContentRef.next(true);
  }


}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService{
  // baseUrl = "biiyxfusqndydqa8txbr-mysql.services.clever-cloud.com";

  constructor(private http: HttpClient) {
  }

  getSPList(){
    return this.http.get("/api/map/sp-list");
  }

  // SHOULD CHANGE THIS TO A POST REQUEST, used for demo purposes only
  addMarker(marker){
    // console.log(marker);
    return this.http.get("/api/map/add-marker?marker="+JSON.stringify(marker));
  }



}

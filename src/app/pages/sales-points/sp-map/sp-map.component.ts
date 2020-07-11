import { Component, OnInit } from '@angular/core';
import { SPMapService } from './sp-map.service';

@Component({
  selector: 'ngx-sp-map',
  templateUrl: './sp-map.component.html',
  styleUrls: ['./sp-map.component.scss']
})
export class SpMapComponent implements OnInit {
  markerSelected: boolean = false;
  mousePos;
  constructor(private map: SPMapService) { }

  ngOnInit() {
    this.map.buildMap();
    this.map.markerSelected.subscribe(value =>{
        this.markerSelected = value;

    })
  }
  exitMarker(e){
    // checks if a "click" event targets a markers, else removes the details
    if ( !(<HTMLElement>e.target).classList.contains('mapboxgl-marker') ) {
      this.map.hideMarkerInfos();
    } else  if ( !(<HTMLElement>e.target).classList.contains('mapboxgl-marker') && (this.markerSelected) ){
      this.map.refrechMarkerInfo();
    }
  }

  }

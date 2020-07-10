import { Component, OnInit } from '@angular/core';
import { SPMapService } from './sp-map.service';

@Component({
  selector: 'ngx-sp-map',
  templateUrl: './sp-map.component.html',
  styleUrls: ['./sp-map.component.scss']
})
export class SpMapComponent implements OnInit {
  markerSelected: boolean;
  mousePos;
  constructor(private map: SPMapService) { }

  ngOnInit() {
    this.map.buildMap();
    this.map.markerSelected.subscribe(value =>{
      this.markerSelected = value;
    })
  }

  }

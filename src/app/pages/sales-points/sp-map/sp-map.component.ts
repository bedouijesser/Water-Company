import { Component, OnInit } from '@angular/core';
import { SPMapService } from './sp-map.service';
import { DataService } from '../../../services/data.service'

@Component({
  selector: 'ngx-sp-map',
  templateUrl: './sp-map.component.html',
  styleUrls: ['./sp-map.component.scss'],
})
export class SpMapComponent implements OnInit {
  markerSelected: boolean = false;
  addMarkerSelected: boolean = false;

  constructor(private map: SPMapService,
              private data: DataService) { }

  ngOnInit() {
    this.data.getSPList().subscribe(value => {
      this.map.buildMap(value);
      this.map.addCustomCtrlForMap();
    })
    this.map.markerSelected.subscribe(value => {
        this.markerSelected = value;
    });
    this.map.addMarkerSelected.subscribe(value => {
      this.addMarkerSelected = value;
    })

  }
  exitMarker(e){
    // Checks to parent if an ancestor has a class name
    function hasSomeParentTheClass(element, classname) {
      if (element.classList.contains(classname)) return true;
      if (element.classList.contains('map')) return false;
      return element.parentNode && hasSomeParentTheClass(element.parentNode, classname);
    }
    // checks if it was an "empty" click or if one of the markers is clicked
    // console.log(e.target)
    if (hasSomeParentTheClass(e.target,'sidebar')){
      return;
    } else if ( !(<HTMLElement>e.target).classList.contains('mapboxgl-marker') ) {
      this.map.hideMarkerInfos();
    } else if ( !(<HTMLElement>e.target).classList.contains('mapboxgl-marker') && (this.markerSelected) ){
      this.map.refrechMarkerInfo();
    }

    // this.map.hideMarkerInfos();
  }

}

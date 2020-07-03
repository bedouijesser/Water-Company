import { Component, OnInit } from '@angular/core';
import { SPMapService } from './sp-map.service';

@Component({
  selector: 'ngx-sp-map',
  templateUrl: './sp-map.component.html',
  styleUrls: ['./sp-map.component.scss']
})
export class SpMapComponent implements OnInit {
  showMapClicked: boolean;

  constructor(private map: SPMapService) { }

  ngOnInit() {

    this.map.buildMap();

    /**************Map */
    // this.data.getMapInofs().subscribe((infos:any)=>{
    //   this.infos=infos;

    //   this.initializeMap();
    // })


  }
//  /// default settings
//  map: mapboxgl.Map;
//  style = 'mapbox://styles/mapbox/streets-v11';
//  lat = 34.8212626;
//  lng = 8.4837896;
//  message = 'Hello World!';

//  // data
//  source: any;
//  markers: any;
//  infos=[];
//  marker: any;
//  private initializeMap() {

//    this.buildMap()

//    this.lng = 51.3076206;
//    this.lat = 25.1;
//    this.map.flyTo({

//      pitch:60,
//      center: [this.lng, this.lat]
//    })

//  }
//  buildMap() {
//    this.addMarker.bind(this);
//    if(!this.global.RTLTextPlugin){
//      mapboxgl.setRTLTextPlugin(
//        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
//        null,
//        true // Lazy load the plugin
//        );
//      this.global.RTLTextPlugin=true;
//    }

//    this.map = new mapboxgl.Map({
//      container: 'map',
//      style: this.style,
//      zoom: 8.7,
//      center: [this.lng, this.lat],
//      localIdeographFontFamily:"'Noto Sans', 'Noto Sans CJK SC', sans-serif"
//    });
//  this.map.on('click', (e) => {
//    this.addMarker(e, this.map);
//  });
//    let marker;
//    for(let info of this.infos){
//       marker = new mapboxgl.Marker()
//      .setLngLat([info.lng,info.lat])
//      .addTo(this.map);
//    }
//      /// Add map controls
//    this.map.addControl(new mapboxgl.NavigationControl());
//  }
//  addMarker(e, map){

//    this.form.get('location').setValue("https://www.google.com/maps/place/"+e.lngLat.lat+","+e.lngLat.lng);
//    this.form.get('lon').setValue(e.lngLat.lng);
//    this.form.get('lat').setValue(e.lngLat.lat);
//    if(this.marker){
//      this.marker.remove();
//    }
//    var el = document.createElement('div');
//    el.className = 'addmarker';
//    el.style.backgroundImage = "url('assets/images/mapbox-icon.png')";
//    el.style.backgroundSize = "cover";
//    el.style.width = "50px";
//    el.style.height = "50px";

//    this.marker = new mapboxgl.Marker(el)
//      .setLngLat([e.lngLat.lng,e.lngLat.lat])
//      .addTo(map);
//  }
//  flyTo(data: GeoJson) {
//    this.map.flyTo({
//      center: data.geometry.coordinates
//    })
//  }
//  removeMarker(marker) {
//  }
//  showMap(){

//    this.showMapClicked=true;

//  }
// }

}

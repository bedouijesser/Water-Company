import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl'
import { environment } from '../../../../environments/environment';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Subject } from 'rxjs';
import { info } from 'console';
@Injectable({
  providedIn: 'root'
})

export class SPMapService {
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 35.8869;
  lng = 9.5375;
  zoom = 6;
  markerSelected: Subject<boolean>;
  markerInfo: Subject<Object>;
  RTLTextPlugin: boolean = false;
  markerInstences = [];
  constructor() {
    mapboxgl.accessToken = environment.mapbox.accessToken;
  }

  buildMap() {
    if(!this.RTLTextPlugin){
      mapboxgl.setRTLTextPlugin(
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
        null,
        true // Lazy load the plugin
        );
      this.RTLTextPlugin=true;
    }
    var spList = [
      {"id": 1,"SP_Name": "Societé Berrich", "SP_Accountant_Name":"Ahmed Berrich"},
      {"id": 2,"SP_Name": "Societé Abadllah", "SP_Accountant_Name":"Salah Ben Abdallah"},
      {"id": 3,"SP_Name": "Societé Gaaloul", "SP_Accountant_Name":"Fathi Gaaloul"},
      {"id": 4,"SP_Name": "Societé Samir", "SP_Accountant_Name":"Yahya Samir"},
    ]
    var geojson = {
      'type': 'FeatureCollection',
      'features': [{
          'type': 'Feature',
          'properties': {
            'title': 'Main-Building',
            'description': 'Main-Building',
            'iconSize': [80, 80],
            'type': 'Home-Building'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [35.35, 10]
          }
        },
        {
          'type': 'Feature',
          'properties': {
            'title': 'Sales-point 1',
            'description': "Societé Berrich",
            'iconSize': [70, 70],
            'type': 'Sales-point'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [33.2158203125, 10.97189158092897]
          }
        },
        {
          'type': 'Feature',
          'properties': {
            'title': 'Sales-point 2',
            'description': "Societé Gaaloul",
            'iconSize': [70, 70],
            'type': 'Sales-Point'
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [32.29223632812499, 10.28151823530889]
          }
        }
      ]
    };

    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: this.zoom,
      center: [this.lng, this.lat],
      attributionControl: false
    })

    var geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      marker: {
      color: 'orange'
      },
      mapboxgl: mapboxgl
      });

    this.map.addControl(geocoder);
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.FullscreenControl({
      container: document.querySelector('.map-element')
    }));

    let marker;


    // Popup instentiation
    let popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      closeOnClick: true,
      anchor: 'bottom'
    });

    // add markers to map

    for (let info of geojson.features) {
      var el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = info.properties.type == 'Home-Building' ? "url('/assets/images/Building-location-icon.png')":"url('/assets/images/SP-location-icon.png')" ;
      el.style.backgroundSize= "cover";
      el.style.width = info.properties.iconSize[0] + 'px';
      el.style.height = info.properties.iconSize[1] + 'px';

      let mouseClickHandler = () => {
        this.markerSelected.next(true);
        this.showMarkerInfos(info);
      }
      el.addEventListener('click',mouseClickHandler.bind(this))

      // Create a new Marker instence and add it to the map
      marker = new mapboxgl.Marker(el)
        .setLngLat([info.geometry.coordinates[1], info.geometry.coordinates[0]])
        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`<p class ='Title'>${info.properties.description}</p>`))
        .addTo(this.map);
        this.markerInstences.push({'name': info.properties.title, 'value': marker});
      }
  }
  showMarkerInfos(info: Object) {
    this.markerInfo.next(info)
  }
}




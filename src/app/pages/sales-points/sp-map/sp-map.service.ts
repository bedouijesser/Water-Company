import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})

export class SPMapService {
  // Map attributes
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 35.8869;
  lng = 9.5375;
  zoom = 6;
  RTLTextPlugin: boolean = false;
  activeMarker = false;
  activeMarkerInstence: mapboxgl.Marker;
  mouseUpCoordonates;
  geoMarker: boolean;

  // Service Attributes
  markerSelected = new Subject < boolean > ();
  addMarkerSelected = new Subject < boolean > ();
  coordonatesSubject = new Subject < string[] > ();
  markerInfo: Object = null;
  markerInstences = [];

  geojson = {
    'type': 'FeatureCollection',
    'features': [{
        'type': 'Feature',
        'properties': {
          'title': 'Main-Building',
          'description': 'Main-Building',
          'manager': 'Ben-Salama Charfeddin',
          'iconSize': [80, 80],
          'type': 'Home-Building',
          'email': 'Company@corporation.com',
          'tel': 98765432,
          'fax': 98765432
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [10, 35.35],
        },
      },
      {
        'type': 'Feature',
        'properties': {
          'title': 'Sales-point 1',
          'description': 'Societé Berrich',
          'manager': 'Ahmed Berrich',
          'iconSize': [70, 70],
          'type': 'Sales-point',
          'email': 'Berrich@corp.com',
          'tel': 98765432,
          'fax': 98765432
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [10, 35.6],
        },
      },
      {
        'type': 'Feature',
        'properties': {
          'title': 'Sales-point 2',
          'description': 'Societé Gaaloul',
          'iconSize': [70, 70],
          'type': 'Sales-Point',
          'manager': 'Fathi Gaaloul',
          'email': 'Gaaloul@corp.com',
          'tel': 98765432,
          'fax': 98765432
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [10, 35.7],
        },
      },
    ],
  };
  constructor() {
    mapboxgl.accessToken = environment.mapbox.accessToken;

  }

  buildMap() {
    if (!this.RTLTextPlugin) {
      mapboxgl.setRTLTextPlugin(
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
        null,
        true, // Lazy load the plugin
      );
      this.RTLTextPlugin = true;
    }


    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: this.zoom,
      center: [this.lng, this.lat],
      attributionControl: false,
    });

    // a fix for when the map is not resizing to it's container
    window.addEventListener('load', () => {
      this.map.resize();
    })
    // ***************** GeoCoder (seachBar) ******************//

    let forwardGeocoder = query => {
      var matchingFeatures = [];
      for (var i = 0; i < this.geojson.features.length; i++) {
        var feature = this.geojson.features[i];
        // handle queries with different capitalization than the source data by calling toLowerCase()
        if (
          feature.properties.description
          .toLowerCase()
          .search(query.toLowerCase()) !== -1
        ) {
          feature['place_name'] = feature.properties.type == "Home-Building" ? '🏢 ' + feature.properties.description : '💧 ' + feature.properties.description;
          feature['center'] = feature.geometry.coordinates;
          feature['place_type'] = ['Sales Point'];
          matchingFeatures.push(feature);
        }
      }
      return matchingFeatures;
    }
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      localGeocoder: forwardGeocoder,
      marker: {
        color: 'orange',
        draggable: true
      },
      mapboxgl: mapboxgl,
    });
    geocoder.on('result', e => {
      this.geoMarker = true;

    })

    //***************** Map Controls ************//
    this.map.addControl(geocoder);
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.FullscreenControl({
      container: document.querySelector('.map-element'),
    }));

    let marker;

    //*************  Adding Markers to the Map instence ********/

    for (const info of this.geojson.features) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = info.properties.type == 'Home-Building' ? 'url(\'/assets/images/Building-location-icon.png\')' : 'url(\'/assets/images/SP-location-icon.png\')';
      el.style.backgroundSize = 'cover';
      el.style.width = info.properties.iconSize[0] + 'px';
      el.style.height = info.properties.iconSize[1] + 'px';

      const mouseClickHandler = () => {
        this.showMarkerInfos(info);
      };
      el.addEventListener('click', mouseClickHandler.bind(this));
      el.addEventListener('mouseenter', () => {
        el.style.cursor = 'pointer';
      })

      // Create a new Marker instence and add it to the map
      marker = new mapboxgl.Marker(el)
        .setLngLat(info.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: true,
            anchor: 'bottom',
          }) // add popups
          .setHTML(`<p class ='Title'>${info.properties.description}</p>`))
        .addTo(this.map);
      this.markerInstences.push({
        'name': info.properties.title,
        'value': marker
      });
    }
    this.map.on('mouseup', e => {
      // console.log('this works')
      // e.lngLat is the longitude, latitude geographical position of the event
      let arr = [e.lngLat.wrap().lng, e.lngLat.wrap().lat];
      // console.log(e.lngLat.wrap())
      this.coordonatesSubject.next(arr);

    });
  }
  addMarkerInfos() {
    this.addMarkerSelected.next(true)
  }
  showMarkerInfos(info: Object) {
    // console.log(info)
    this.markerInfo = info;
    this.markerSelected.next(true);
  }
  refrechMarkerInfo() {
    this.hideMarkerInfos();
    this.showMarkerInfos(this.markerInfo);
  }
  hideMarkerInfos() {
    this.markerInfo = null;
    this.markerSelected.next(false);
  }

  // this.addMarkerSelected.next(false);

  // adds the Add Marker button
  addCustomCtrlForMap() {
    let topRightCtrlContainer = document.querySelector('div.mapboxgl-ctrl-top-right');
    const el = document.createElement('div');

    el.innerHTML = `
    <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
      <button class="custom-ctrl-addMarker" type="button" aria-label="Add Marker" title="Add Marker">
        <span class="addMarkerIcon">📌</span>
      </button>
    </div>`;

    el.addEventListener('click', e => {
      if (this.activeMarkerInstence ) this.activeMarkerInstence.remove();
      if (!this.geoMarker){
        this.activeMarkerInstence = new mapboxgl.Marker({
          draggable: true,
          color: 'orange'
        })
        .setLngLat(this.map.getCenter())
        .addTo(this.map);

        this.addMarkerSelected.next(true);
        this.activeMarker = true;
      }

    })
    topRightCtrlContainer.append(el);
  }
  addSPMarker(info){
    let feature = {
      'type': 'Feature',
      'properties': {
        'title': 'Sales-point 3',
        'description': info.name,
        'manager': info.manager,
        'iconSize': [80, 80],
        'type': 'Sales-Point',
        'email': info.email,
        'fax': info.fax,
        'tel': info.tel
      },
      'geometry': {
        'type': 'Point',
        'coordinates': info.coordonates.split(','),
      }
    }
    console.log(feature.geometry.coordinates)
    this.geojson.features.push(feature)
    this.buildMap();
    this.addMarkerSelected.next(false);
  }



}

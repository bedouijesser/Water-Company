import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../../environments/environment';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Subject, BehaviorSubject } from 'rxjs';
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
  addMarkerSelected = new BehaviorSubject(false);
  coordonatesSubject = new Subject < string[] > ();
  markerInfo: Object = null;
  markerInstences = [];

  geojson = {
    'type': 'FeatureCollection',
    'features': []
  };
  constructor() {
    mapboxgl.accessToken = environment.mapbox.accessToken;
  }

  buildMap(value) {

    if(this.geojson.features.length === 0){

      // Gets the values from the Database

      (<Array<Object>>value).forEach(spValue => {
        // console.log(spValue);
        let coordinates = typeof(spValue["SP_Coordonates"]) === "string" ? JSON.parse(spValue["SP_Coordonates"]) : spValue["SP_Coordonates"];
        // console.log(spValue["SP_Coordonates"]);
        let obj = {

          'type': 'Feature',
          'properties': {
            'title': spValue["SP_Title"],
            'description': spValue["SP_Description"],
            'iconSize': [70, 70],
            'type': spValue["SP_Type"],
            'manager': spValue["SP_Manager"],
            'email': spValue["SP_Email"],
            'tel': spValue["SP_Tel"],
            'fax': spValue["SP_Fax"]
          },
          'geometry': {
            'type': 'Point',
            'coordinates': coordinates,
          }
        }
        // console.log(obj);
        this.geojson.features.push(obj);
      });

    } else {
      this.geojson.features=value;
    }



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
    this.map.on('load', () => {
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
      if (this.activeMarkerInstence){
        this.activeMarkerInstence.remove();
      }

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
      el.style.backgroundImage = info.properties.type == 'Main-Building' ? 'url(\'/assets/images/Building-location-icon.png\')' : 'url(\'/assets/images/SP-location-icon.png\')';
      el.style.backgroundSize = 'cover';
      el.style.width = info.properties.iconSize[0] + 'px';
      el.style.height = info.properties.iconSize[1] + 'px';

      const mouseClickHandler = () => {
        this.showMarkerInfos(info);
        this.map.flyTo({
          center: info.geometry.coordinates
          });
        if( this.activeMarkerInstence ) this.activeMarkerInstence.remove();
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
  // Custom "add marker" control
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
      if (this.activeMarkerInstence ) {
        this.activeMarkerInstence.remove();
        this.addMarkerSelected.next(false);
        this.activeMarkerInstence = null;
        return;
      }
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
  addMarkerInfos() {
    this.addMarkerSelected.next(true)
  }
  showMarkerInfos(info: Object) {
    // console.log(info)
    this.markerInfo = info;
    this.markerSelected.next(true);
    this.addMarkerSelected.next(false);
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

  addSPMarker(feature){
    // console.log(this.geojson.features)
    // console.log(feature.geometry.coordinates);
    this.geojson.features.push(feature)
    this.buildMap(this.geojson.features);
    this.addMarkerSelected.next(false);
  }



}

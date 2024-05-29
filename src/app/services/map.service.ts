import { environment } from '../../environments/environment';
import mapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { ElementRef, Injectable } from '@angular/core';
import { IMapFeature } from '../types/map.interface';
import mapboxDraw from '@mapbox/mapbox-gl-draw/';
import * as geojson from 'geojson';
import mapboxgl from 'mapbox-gl';

@Injectable({ providedIn: 'root' })
export class MapService {
  public map: mapboxgl.Map;
  public draw: mapboxDraw;
  public poligonHeight = 0;
  public selectedFeatureIds: string[] = [];
  public mapStyles: { [key: string]: string } = {
    Standart: 'mapbox://styles/mapbox/standard',
    Streets: 'mapbox://styles/mapbox/streets-v11',
    Outdoors: 'mapbox://styles/mapbox/outdoors-v11',
    Light: 'mapbox://styles/mapbox/light-v10',
    Dark: 'mapbox://styles/mapbox/dark-v10',
    Satellite: 'mapbox://styles/mapbox/satellite-v9',
    'Satellite Streets': 'mapbox://styles/mapbox/satellite-streets-v11',
  };
  public selectedStyle: string = 'Streets';

  constructor() {}

  createMap(mapElement: ElementRef) {
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: mapElement.nativeElement,
      center: [37.618423, 55.751244], // Центр карты (Москва)
      doubleClickZoom: true,
      zoom: 17,
    });

    this.addMapListeners();
  }

  addMapListeners() {
    this.map.on('load', () => {
      this.initializeTools();
      this.initializePolygons();
      this.loadPolygonsFromLocalStorage();
    });

    this.map.on('draw.create', this.updatePolygonLayer.bind(this));
    this.map.on('draw.update', this.updatePolygonLayer.bind(this));
    this.map.on('draw.selectionchange', this.onSelectionChange.bind(this));
  }

  initializeTools() {
    this.draw = new mapboxDraw({
      displayControlsDefault: false,
    });
    this.map.addControl(this.draw);

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    this.map.addControl(
      new mapboxGeocoder({
        accessToken: environment.mapbox.accessToken,
        mapboxgl: mapboxgl,
      }),
      'top-left'
    );
  }

  initializePolygons() {
    this.map.addSource('polygons', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    this.map.addLayer({
      id: 'polygons-layer',
      type: 'fill-extrusion',
      source: 'polygons',
      paint: {
        'fill-extrusion-color': '#888',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.6,
      },
    });
  }

  loadPolygonsFromLocalStorage() {
    const jsonPolygons = localStorage.getItem('drawData');
    if (!jsonPolygons) return;

    this.saveDrawData(JSON.parse(jsonPolygons), false);
  }

  setExtrudeHeight(height: number) {
    const data = this.draw.getAll();

    if (data.features.length && this.selectedFeatureIds.length) {
      data.features.forEach((feature) => {
        if (this.selectedFeatureIds.includes(feature.id as string)) {
          feature.properties = feature.properties || {};
          feature.properties['height'] = height;
        }
      });

      this.saveDrawData(data);
    }
  }

  onSelectionChange(e: any) {
    if (e.features.length > 0) {
      this.selectedFeatureIds = e.features.map((f: IMapFeature) => f.id);
    } else {
      this.selectedFeatureIds = [];
    }
  }

  updatePolygonLayer() {
    const data = this.draw.getAll();
    this.saveDrawData(data);
  }

  saveDrawData(data: geojson.FeatureCollection, saveInLocalStorage = true) {
    this.draw.set(data);
    (this.map.getSource('polygons') as mapboxgl.GeoJSONSource).setData(data);

    if (saveInLocalStorage) {
      localStorage.setItem('drawData', JSON.stringify(data));
    }
  }
}

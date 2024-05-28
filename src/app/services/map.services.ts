import { environment } from '../../environments/environment';
import mapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { IMapFeature } from '../types/map.interdace';
import mapboxDraw from '@mapbox/mapbox-gl-draw/';
import mapboxgl from 'mapbox-gl';
import { ElementRef, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MapService {
	public map: mapboxgl.Map;
	public draw: mapboxDraw;
	public poligonHeight = 0;
	public selectedFeatureIds: string[] = [];

	constructor() {}

	createMap(mapElement: ElementRef) {
		this.map = new mapboxgl.Map({
			accessToken: environment.mapbox.accessToken,
			container: mapElement.nativeElement,
			center: [37.618423, 55.751244], // Центр карты (Москва)
			doubleClickZoom: true,
			zoom: 17,
		});

		this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

		this.map.on('load', () => {
			this.initializeDrawTools();
			this.initialPolygonsHeight();
			this.eventDrawSelectionChange();
		});
	}

	initializeDrawTools() {
		this.draw = new mapboxDraw({
			displayControlsDefault: false,
		});

		this.map.addControl(this.draw);
		this.map.addControl(
			new mapboxGeocoder({
				accessToken: environment.mapbox.accessToken,
				mapboxgl: mapboxgl,
			}),
			'top-left'
		);
	}

	initialPolygonsHeight() {
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

	setExtrudeHeight() {
		const data = this.draw.getAll();

		if (data.features.length && this.selectedFeatureIds.length) {
			data.features.forEach((feature) => {
				if (this.selectedFeatureIds.includes(feature.id as string)) {
					feature.properties = feature.properties || {};
					feature.properties['height'] = this.poligonHeight;
				}
			});

			(this.map.getSource('polygons') as mapboxgl.GeoJSONSource).setData(data);
		}
	}

	setExtrudeHeightAll() {
		const data = this.draw.getAll();

		if (data.features.length) {
			data.features.forEach((feature) => {
				feature.properties = feature.properties || {};
				feature.properties['height'] = this.poligonHeight;
			});
		}

		(this.map.getSource('polygons') as mapboxgl.GeoJSONSource).setData(data);
	}

	eventDrawSelectionChange() {
		this.map.on('draw.selectionchange', this.onSelectionChange.bind(this));
	}

	onSelectionChange(e: any) {
		if (e.features.length > 0) {
			this.selectedFeatureIds = e.features.map((f: IMapFeature) => f.id);
		} else {
			this.selectedFeatureIds = [];
		}
	}
}

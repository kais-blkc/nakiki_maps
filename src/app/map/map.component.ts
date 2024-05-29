import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import mapboxDraw from '@mapbox/mapbox-gl-draw/';
import mapboxgl from 'mapbox-gl';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapService } from '../services/map.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapElement') mapElement: ElementRef;

  public map: mapboxgl.Map;
  public draw: mapboxDraw;
  public poligonHeight = 0;
  public selectedFeatureIds: string[] = [];

  constructor(private mapService: MapService) {}

  ngAfterViewInit(): void {
    this.mapService.createMap(this.mapElement);
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MapService } from '../services/map.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatSliderModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  public poligonHeight = 0;

  constructor(private mapService: MapService) {}

  setDrawMode(mode: string) {
    this.mapService.draw.changeMode(mode);
  }

  deleteDraw() {
    this.mapService.draw.delete(this.mapService.selectedFeatureIds);
    this.mapService.updatePolygonLayer();
  }

  deleteDrawAll() {
    const data = this.mapService.draw.getAll();

    if (data.features.length > 0) {
      this.mapService.draw.deleteAll();
      this.mapService.updatePolygonLayer();
    }
  }

  setHeight() {
    this.mapService.setExtrudeHeight(this.poligonHeight);
  }
}

import { TestBed } from '@angular/core/testing';

import { CargarChartsService } from './cargar-charts.service';

describe('CargarChartsService', () => {
  let service: CargarChartsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CargarChartsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

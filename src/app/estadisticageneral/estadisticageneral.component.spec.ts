import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticageneralComponent } from './estadisticageneral.component';

describe('EstadisticageneralComponent', () => {
  let component: EstadisticageneralComponent;
  let fixture: ComponentFixture<EstadisticageneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadisticageneralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadisticageneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

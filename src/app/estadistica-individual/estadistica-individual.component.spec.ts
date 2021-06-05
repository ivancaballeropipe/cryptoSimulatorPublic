import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticaIndividualComponent } from './estadistica-individual.component';

describe('EstadisticaIndividualComponent', () => {
  let component: EstadisticaIndividualComponent;
  let fixture: ComponentFixture<EstadisticaIndividualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadisticaIndividualComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadisticaIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

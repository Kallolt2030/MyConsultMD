import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePacientePage } from './detalle-paciente.page';

describe('DetallePacientePage', () => {
  let component: DetallePacientePage;
  let fixture: ComponentFixture<DetallePacientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallePacientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

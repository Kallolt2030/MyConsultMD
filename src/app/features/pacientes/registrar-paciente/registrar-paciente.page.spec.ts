import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarPacientePage } from './registrar-paciente.page';

describe('RegistrarPacientePage', () => {
  let component: RegistrarPacientePage;
  let fixture: ComponentFixture<RegistrarPacientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarPacientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

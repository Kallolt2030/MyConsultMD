import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaPacientesPage } from './lista-pacientes.page';

describe('ListaPacientesPage', () => {
  let component: ListaPacientesPage;
  let fixture: ComponentFixture<ListaPacientesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaPacientesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

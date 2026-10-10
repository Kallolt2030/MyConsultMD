import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarCitaPage } from './editar-cita.page';

describe('EditarCitaPage', () => {
  let component: EditarCitaPage;
  let fixture: ComponentFixture<EditarCitaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarCitaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

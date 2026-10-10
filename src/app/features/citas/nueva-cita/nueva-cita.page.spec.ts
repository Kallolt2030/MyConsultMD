import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevaCitaPage } from './nueva-cita.page';

describe('NuevaCitaPage', () => {
  let component: NuevaCitaPage;
  let fixture: ComponentFixture<NuevaCitaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaCitaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

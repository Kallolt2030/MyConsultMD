import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnviarRecordatorioPage } from './enviar-recordatorio.page';

describe('EnviarRecordatorioPage', () => {
  let component: EnviarRecordatorioPage;
  let fixture: ComponentFixture<EnviarRecordatorioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EnviarRecordatorioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

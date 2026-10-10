import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigRecordatoriosPage } from './config-recordatorios.page';

describe('ConfigRecordatoriosPage', () => {
  let component: ConfigRecordatoriosPage;
  let fixture: ComponentFixture<ConfigRecordatoriosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigRecordatoriosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

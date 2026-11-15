import { TestBed } from '@angular/core/testing';
import { FotoPaciente } from './foto-paciente';

describe('FotoPaciente', () => {
  let service: FotoPaciente;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FotoPaciente);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { OcrServiceTs } from './ocr.service.ts';

describe('OcrServiceTs', () => {
  let service: OcrServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OcrServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

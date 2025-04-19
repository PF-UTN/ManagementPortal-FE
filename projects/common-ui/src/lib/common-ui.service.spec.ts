import { TestBed } from '@angular/core/testing';

import { CommonUiService } from './common-ui.service';

describe('CommonUiService', () => {
  let service: CommonUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

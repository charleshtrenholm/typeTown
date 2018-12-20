import { TestBed } from '@angular/core/testing';

import { TypeGameService } from './type-game.service';

describe('TypeGameService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypeGameService = TestBed.get(TypeGameService);
    expect(service).toBeTruthy();
  });
});

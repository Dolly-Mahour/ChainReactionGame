import { TestBed } from '@angular/core/testing';

import { GameConditionsService } from './game-conditions.service';

describe('GameConditionsService', () => {
  let service: GameConditionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameConditionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

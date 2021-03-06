import {inject, TestBed} from '@angular/core/testing';

import {SortPipe} from './sort.pipe';

describe('Champion SortPipe', () => {
  let champions = [];
  const champion1 = {id: 1, name: 'Amumu', info: {attack: 1, magic: 8, defense: 6, difficulty: 3}};
  const champion2 = {id: 2, name: 'Ahri', info: {attack: 3, magic: 8, defense: 4, difficulty: 5}};
  const champion3 = {
    id: 3,
    name: 'Vel\'Koz',
    info: {attack: 2, magic: 10, defense: 2, difficulty: 8}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [SortPipe]});
    champions = [champion1, champion2, champion3];
  });

  it('should order alphabetical on \'null\'', inject([SortPipe], (pipe) => {
       const result = pipe.transform(champions, null);
       expect(result).toHaveEqualContent([champion2, champion1, champion3]);  // alphabetical order
     }));

  it('should order alphabetical on \'true\'', inject([SortPipe], (pipe) => {
       const result = pipe.transform(champions, true);
       expect(result).toHaveEqualContent([champion2, champion1, champion3]);  // alphabetical order
     }));

  it('should not filter on \'\'', inject([SortPipe], (pipe) => {
       const result = pipe.transform(champions, '');
       expect(result).toHaveEqualContent([champion2, champion1, champion3]);  // alphabetical order
     }));

  it('should order by \'attack\'', inject([SortPipe], (pipe) => {
       const result = pipe.transform(champions, 'attack');
       expect(result).toHaveEqualContent([champion2, champion3, champion1]);  // 'attack' order
     }));

  it('should order by \'magic\'', inject([SortPipe], (pipe) => {
       const result = pipe.transform(champions, 'magic');
       expect(result).toContain(champion1);  // 'magic' order (magic of id:1 and
                                             // id:2 are equal, therefore the
                                             // order is unknown)
       expect(result).toContain(champion2);
       expect(result[0]).toBe(champion3);
     }));

  it('should order by \'defense\'', inject([SortPipe], (pipe) => {
       const result = pipe.transform(champions, 'defense');
       expect(result).toHaveEqualContent([champion1, champion2, champion3]);  // 'defense' order
     }));

  it('should order by \'difficulty\'', inject([SortPipe], (pipe) => {
       const result = pipe.transform(champions, 'difficulty');
       expect(result).toHaveEqualContent([champion3, champion2, champion1]);  // 'difficulty' order
     }));
});

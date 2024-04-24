import { Injectable } from '@angular/core';
import { RANKS } from 'src/constants/tables/ranks';
import { filter, find } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class RankService {
  constructor() { }

  public async getRank(id: string) {
    return find(RANKS, { id });
  }
  public async fetchRanksForUnit(unitId: string) {
    return filter(RANKS, { unitId });
  }
}

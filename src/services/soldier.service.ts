import { Injectable } from '@angular/core';
import { SOLDIERS } from 'src/constants/tables/soldiers';
import { filter, find } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class SoldierService {
  constructor() { }

  public async getSoldier(id: string) {
    return find(SOLDIERS, { id });
  }
  public async fetchSoldiersForUnit(unitId: string) {
    return filter(SOLDIERS, { unitId });
  }
}

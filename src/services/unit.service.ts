import { Injectable } from '@angular/core';
import { UNITS } from 'src/constants/tables/units';
import { find } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  constructor() {}

  public async getUnit(id: string) {
    return find(UNITS, { id });
  }
}

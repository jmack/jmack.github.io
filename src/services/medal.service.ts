import { Injectable } from '@angular/core';
import { MEDALS } from 'src/constants/tables/medals';
import { SOLDIER_MEDALS } from 'src/constants/tables/soldier-medals';
import { filter, find } from 'lodash-es';
import { SoldierService } from './soldier.service';

@Injectable({
  providedIn: 'root',
})
export class MedalService {
  constructor(private soldierService: SoldierService) {}

  public async getMedal(id: string) {
    return find(MEDALS, { id });
  }

  public async fetchMedalsForUnit(unitId: string) {
    return filter(MEDALS, { unitId });
  }

  public async fetchMedalsForSoldier(soldierId: string) {
    const soldier = await this.soldierService.getSoldier(soldierId);

    if (!soldier) {
      return [];
    }

    const soldierMedals = filter(SOLDIER_MEDALS, { soldierId });
    const unitMedals = await this.fetchMedalsForUnit(soldier.unitId);

    return soldierMedals.map((soldierMedal) => {
      soldierMedal.medal = find(unitMedals, { id: soldierMedal.id });
      return soldierMedal;
    });
  }
}

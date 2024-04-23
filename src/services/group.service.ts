import { Injectable } from '@angular/core';
import { GROUPS } from 'src/constants/tables/groups';
import { filter, find } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor() { }

  public async getGroup(id: string) {
    return find(GROUPS, { id, });
  }

  public async fetchGroupsForUnit(unitId: string) {
    return filter(GROUPS, { unitId });
  }
}

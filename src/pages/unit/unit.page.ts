import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { find, orderBy } from 'lodash-es';
import { Group } from 'src/constants/tables/groups';
import { Rank } from 'src/constants/tables/ranks';
import { Soldier } from 'src/constants/tables/soldiers';
import { Unit } from 'src/constants/tables/units';
import { GroupService } from 'src/services/group.service';
import { RankService } from 'src/services/rank.service';
import { SoldierService } from 'src/services/soldier.service';
import { UnitService } from 'src/services/unit.service';

export type DisplayItem = {
  item: Unit | Group;
  groups: DisplayItem[];
  soldiers: DisplaySoldier[];
};
export type DisplaySoldier = {
  soldier: Soldier;
  rank: Rank;
};

@Component({
  selector: 'unit-page',
  templateUrl: './unit.page.html',
  styleUrls: ['./unit.page.scss'],
})
export class UnitPage {
  unit?: DisplayItem;

  groups?: Group[];
  soldiers?: Soldier[];
  ranks?: Rank[];

  constructor(
    private route: ActivatedRoute,
    private unitService: UnitService,
    private groupService: GroupService,
    private soldierService: SoldierService,
    private rankService: RankService,
  ) {}

  async ngOnInit() {
    const unit = await this.unitService.getUnit(
      this.route.snapshot.paramMap.get('id')!,
    );
    if (!unit) {
      throw 'aaah'; // redirect to home
    }

    const [groups, soldiers, ranks] = await Promise.all([
      this.groupService.fetchGroupsForUnit(unit.id),
      this.soldierService.fetchSoldiersForUnit(unit.id),
      this.rankService.fetchRanksForUnit(unit.id),
    ]);

    this.groups = groups;
    this.soldiers = soldiers;
    this.ranks = ranks;

    this.unit = {
      item: unit,
      groups: orderBy(this.getGroupsForItem(undefined), ['item.weight'], ['desc']),
      soldiers: orderBy(this.getSoldiersForItem(undefined), ['rank.weight'], ['desc']),
    };

    console.log(this.unit);
  }

  private getGroupsForItem(itemId: string | undefined): DisplayItem[] {
    return (
      this.groups
        ?.filter((group) => group.parentId === itemId)
        .map((group) => ({
          item: group,
          groups: orderBy(this.getGroupsForItem(group.id), ['item.weight'], ['desc']),
          soldiers: orderBy(this.getSoldiersForItem(group.id), ['rank.weight'], ['desc']),
        })) ?? []
    );
  }

  private getSoldiersForItem(itemId: string | undefined): DisplaySoldier[] {
    return (
      this.soldiers
        ?.filter(
          (soldier) => soldier.groupId === itemId || soldier.unitId === itemId,
        )
        .map((soldier) => this.getDisplaySoldierFromSoldier(soldier)) ?? []
    );
  }

  private getDisplaySoldierFromSoldier(soldier: Soldier): DisplaySoldier {
    const rank = find(this.ranks, { id: soldier.rankId });
    if (!rank) {
      throw Error(
        `Soldier ${soldier.id} rank of ${soldier.rankId} is missing from ranks!`,
      );
    }

    return { soldier, rank };
  }
}

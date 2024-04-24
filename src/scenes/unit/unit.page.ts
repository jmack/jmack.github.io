import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { find, get } from 'lodash-es';
import { Group } from 'src/constants/tables/groups';
import { Rank } from 'src/constants/tables/ranks';
import { Soldier } from 'src/constants/tables/soldiers';
import { Unit } from 'src/constants/tables/units';
import { GroupService } from 'src/services/group.service';
import { RankService } from 'src/services/rank.service';
import { SoldierService } from 'src/services/soldier.service';
import { UnitService } from 'src/services/unit.service';

type DisplayUnit = {
  unit: Unit;
  groups: DisplayGroup[];
  soldiers: DisplaySoldier[];
};
type DisplayGroup = {
  group: Group;
  soldiers: DisplaySoldier[];
};
type DisplaySoldier = {
  soldier: Soldier;
  rank: Rank;
};

@Component({
  selector: 'unit-page',
  templateUrl: './unit.page.html',
  styleUrls: ['./unit.page.scss']
})
export class UnitPage {
  unit?: DisplayUnit;

  constructor(
    private route: ActivatedRoute,
    private unitService: UnitService,
    private groupService: GroupService,
    private soldierService: SoldierService,
    private rankService: RankService,
  ) { }

  async ngOnInit() {
    const unit = await this.unitService.getUnit(this.route.snapshot.paramMap.get('id')!);
    if (!unit) {
      throw "aaah"; // redirect to home
    }

    const [ groups, soldiers, ranks ] = await Promise.all([
      this.groupService.fetchGroupsForUnit(unit.id),
      this.soldierService.fetchSoldiersForUnit(unit.id),
      this.rankService.fetchRanksForUnit(unit.id),
    ]);

    this.unit = {
      unit,
      groups: groups.map(group => ({
        group,
        soldiers: soldiers.filter(soldier => soldier.groupId === group.id).map(soldier => this.getDisplaySoldierFromSoldier(ranks, soldier))
      })),
      soldiers: soldiers.filter(soldier => !soldier.groupId).map(soldier => this.getDisplaySoldierFromSoldier(ranks, soldier)),
    };

  }

  private getDisplaySoldierFromSoldier(ranks: Rank[], soldier: Soldier): DisplaySoldier {
    const rank = find(ranks, { id: soldier.rankId });
    if (!rank) {
      throw Error(`Soldier ${soldier.id} rank of ${soldier.rankId} is missing from ranks!`);
    }

    return { soldier, rank }
  }
}

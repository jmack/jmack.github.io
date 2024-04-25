import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Group } from 'src/constants/tables/groups';
import { Rank } from 'src/constants/tables/ranks';
import { SoldierMedal } from 'src/constants/tables/soldier-medals';
import { Soldier } from 'src/constants/tables/soldiers';
import { Unit } from 'src/constants/tables/units';
import { GroupService } from 'src/services/group.service';
import { MedalService } from 'src/services/medal.service';
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
  selector: 'soldier-page',
  templateUrl: './soldier.page.html',
  styleUrls: ['./soldier.page.scss'],
})
export class SoldierPage {
  soldier?: Soldier;

  group?: Group;
  unit?: Unit;
  rank?: Rank;
  medals: SoldierMedal[] = [];

  constructor(
    private route: ActivatedRoute,
    private unitService: UnitService,
    private groupService: GroupService,
    private soldierService: SoldierService,
    private medalService: MedalService,
    private rankService: RankService,
  ) {}

  async ngOnInit() {
    this.soldier = await this.soldierService.getSoldier(
      this.route.snapshot.paramMap.get('id')!,
    );
    if (!this.soldier) {
      throw 'aaah'; // redirect to home
    }

    [this.unit, this.group, this.rank, this.medals] = await Promise.all([
      this.unitService.getUnit(this.soldier.unitId),
      this.soldier.groupId
        ? this.groupService.getGroup(this.soldier.groupId)
        : undefined,
      this.rankService.getRank(this.soldier.rankId),
      this.medalService.fetchMedalsForSoldier(this.soldier.id),
    ]);
  }
}

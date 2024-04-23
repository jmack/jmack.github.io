import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Group } from 'src/constants/tables/groups';
import { Unit } from 'src/constants/tables/units';
import { GroupService } from 'src/services/group.service';
import { UnitService } from 'src/services/unit.service';

@Component({
  selector: 'unit-page',
  templateUrl: './unit.page.html',
  styleUrls: ['./unit.page.scss']
})
export class UnitPage {
  unit?: Unit;
  groups?: Group[];

  constructor(
    private route: ActivatedRoute,
    private unitService: UnitService,
    private groupService: GroupService,
  ) { }

  async ngOnInit() {
    this.unit = await this.unitService.getUnit(this.route.snapshot.paramMap.get('id')!);
    if (!this.unit) {
      throw "aaah";
    }

    this.groups = await this.groupService.fetchGroupsForUnit(this.unit.id);
  }
}

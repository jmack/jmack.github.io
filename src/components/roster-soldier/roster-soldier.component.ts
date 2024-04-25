import { Component, Input } from '@angular/core';
import { DisplaySoldier } from '../../pages/unit/unit.page';

@Component({
  selector: 'roster-soldier',
  templateUrl: './roster-soldier.component.html',
  styleUrls: ['./roster-soldier.component.scss'],
})
export class RosterSoldierComponent {
  @Input() soldier?: DisplaySoldier;

  constructor() {}
}

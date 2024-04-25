import { Component, Input } from '@angular/core';
import { DisplayItem } from '../../pages/unit/unit.page';

@Component({
  selector: 'roster-group',
  templateUrl: './roster-group.component.html',
  styleUrls: ['./roster-group.component.scss'],
})
export class RosterGroupComponent {
  @Input() groups?: DisplayItem[];
  @Input() nesting: number = 0;

  constructor() {}
}

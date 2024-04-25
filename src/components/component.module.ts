import { NgModule } from '@angular/core';
import { AppComponent } from 'src/app.component';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RosterGroupComponent } from './roster-group/roster-group.component';
import { RosterSoldierComponent } from './roster-soldier/roster-soldier.component';
import { RouterLink } from '@angular/router';

@NgModule({
  declarations: [RosterGroupComponent, RosterSoldierComponent],
  imports: [BrowserModule, CommonModule, RouterLink],
  exports: [RosterGroupComponent, RosterSoldierComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class ComponentModule {}

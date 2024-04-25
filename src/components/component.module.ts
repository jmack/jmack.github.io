import { NgModule } from '@angular/core';
import { AppComponent } from 'src/app.component';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { RosterGroupComponent } from './roster-group/roster-group.component';
import { RosterSoldierComponent } from './roster-soldier/roster-soldier.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    HeaderComponent,
    RosterGroupComponent,
    RosterSoldierComponent,
    SidebarComponent,
  ],
  imports: [BrowserModule, CommonModule, RouterLink],
  exports: [
    HeaderComponent,
    RosterGroupComponent,
    RosterSoldierComponent,
    SidebarComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class ComponentModule {}

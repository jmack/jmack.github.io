import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitPage } from './pages/unit/unit.page';
import { SoldierPage } from './pages/soldier/soldier.page';

const routes: Routes = [
  {
    path: 'unit/:id',
    component: UnitPage,
  },
  {
    path: 'soldier/:id',
    component: SoldierPage,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

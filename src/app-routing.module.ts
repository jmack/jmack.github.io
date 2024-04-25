import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnitPage } from './scenes/unit/unit.page';

const routes: Routes = [
  {
    path: 'unit/:id',
    component: UnitPage,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

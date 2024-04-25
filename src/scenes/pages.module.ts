import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { ComponentModule } from "src/components/component.module";
import { UnitPage } from "./unit/unit.page";
import { AppComponent } from "src/app.component";

@NgModule({
  declarations: [
    UnitPage,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ComponentModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class PagesModule { }
import "zone.js/dist/zone-mix";
import "reflect-metadata";
import "../polyfills";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { HttpClientModule, HttpClient } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";

// NG Translate
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { AppComponent } from "./app.component";
import { TitleComponent } from "./components/title/title.component";
import { SplitsListComponent } from "./components/splits-list/splits-list.component";
import { SplitComponent } from "./components/split/split.component";
import { ManualInputComponent } from "./components/manual-input/manual-input.component";
import { GameVisionInputComponent } from "./components/game-vision-input/game-vision-input.component";
import { DeathsComponent } from "./components/deaths/deaths.component";
import { PaceComponent } from "./components/pace/pace.component";
import { MostRecentSplitValueComponent } from "./components/most-recent-split-value/most-recent-split-value.component";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    TitleComponent,
    SplitsListComponent,
    SplitComponent,
    ManualInputComponent,
    GameVisionInputComponent,
    DeathsComponent,
    PaceComponent,
    MostRecentSplitValueComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

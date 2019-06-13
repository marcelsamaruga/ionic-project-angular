import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { PlacesPage } from './places.page';
import { PlacesRoutingModel } from './places-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PlacesRoutingModel
  ],
  declarations: [PlacesPage]
})
export class PlacesPageModule {}

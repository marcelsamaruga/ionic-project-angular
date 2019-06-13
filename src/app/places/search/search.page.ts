import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { PlacesService } from './../places.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../../places/places.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit, OnDestroy {

  places: Place[];
  private placesSubscription: Subscription;
  private isLoaded = false;

  constructor(private placesService: PlacesService, private loaderController: LoadingController) { }

  ngOnInit() {
    // this.places = this.placesService.getPlaces();
    this.placesSubscription = this.placesService.places.subscribe( places => {
      this.places = places;
    })
  }

  ionViewWillEnter() {
    this.loaderController.create({
      message: 'Loading'
    }).then( loaderElement => {
      loaderElement.present();
      this.placesService.fetchPlaces().subscribe( () => {
        this.isLoaded = true;
        loaderElement.dismiss();
      });
    } )
  }

  ngOnDestroy() {
    if (this.placesSubscription) {
      this.placesSubscription.unsubscribe();
    }
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log( event.detail );
    console.log( event.detail.value );
  }

  getImage(imgUrl: string) {
    return imgUrl;
    //return btoa(imgUrl);
      //return atob(imgUrl);
  }
  
}

import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { PlacesService } from "../../places/places.service";
import { Place } from "../../places/places.model";
import { IonItemSliding } from "@ionic/angular";
import { Subscription } from "rxjs";
import { map, take, tap } from "rxjs/operators";

interface PlaceResponseData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Component({
  selector: "app-offers",
  templateUrl: "./offers.page.html",
  styleUrls: ["./offers.page.scss"]
})
export class OffersPage implements OnInit, OnDestroy {
  private offers: Place[] = [];
  private firebaseJson = 'place.json';
  private placesSubscription: Subscription;
  private isLoading = false;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.placesSubscription = this.placesService.places.subscribe(places => {
      this.offers = places;
    });
  }

  ionViewWillEnter() {
    this.placesService.fetchPlaces().subscribe( () => {
      this.isLoading = true;
    });
  }

  ngOnDestroy() {
    this.placesSubscription.unsubscribe();
  }

}

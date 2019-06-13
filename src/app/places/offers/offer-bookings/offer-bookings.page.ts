import { Subscription } from "rxjs";
import { PlacesService } from "./../../places.service";
import { NavController } from "@ionic/angular";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Place } from "../../../places/places.model";

@Component({
  selector: "app-offer-bookings",
  templateUrl: "./offer-bookings.page.html",
  styleUrls: ["./offer-bookings.page.scss"]
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  offer: Place;
  private offerSub: Subscription;

  constructor(
    private activatedRouter: ActivatedRoute,
    private navController: NavController,
    private placeService: PlacesService
  ) {}

  ngOnInit() {
    this.activatedRouter.paramMap.subscribe(paramMap => {
      if (!paramMap) {
        this.navController.navigateBack("/places/tabs/offers");
        return;
      }

      //this.offer = this.placeService.getPlaceById( paramMap.get('placeId') );
      this.offerSub = this.placeService
        .getPlaceById(paramMap.get("placeId"))
        .subscribe(offer => {
          this.offer = offer;
        });
    });
  }

  ngOnDestroy() {
    if (this.offerSub) {
      this.offerSub.unsubscribe();
    }
  }
}

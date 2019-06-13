import { MapModalComponent } from './../../../shared/map-modal/map-modal.component';
import { BookingService } from './../../../bookings/booking.service';
import { Subscription } from "rxjs";
import { CreateBookComponent } from "./../../../bookings/create-book/create-book.component";
import { Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { PlacesService } from "./../../places.service";
import {
  LoadingController,
  NavController,
  ModalController,
  ActionSheetController,
  AlertController
} from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { Place } from "../../../places/places.model";

@Component({
  selector: "app-place-detail",
  templateUrl: "./place-detail.page.html",
  styleUrls: ["./place-detail.page.scss"]
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  private place: Place;
  private placeSubscription: Subscription;
  private isLoading = false;

  constructor(
    private activatedRouter: ActivatedRoute,
    private navController: NavController,
    private placeService: PlacesService,
    private router: Router,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private alertController: AlertController
  ) {}

  onBookPlace() {
    // this.router.navigateByUrl('/places/tabs/search');
    // option below for a nicer animation
    // this.navController.navigateBack('/places/tabs/search');
    this.actionSheetController
      .create({
        header: "Choose an action",
        buttons: [
          {
            text: "Select a Date",
            handler: () => {
              this.openBookingModal("random");
            }
          },
          {
            text: "Random Date",
            handler: () => {
              this.openBookingModal("random");
            }
          },
          {
            text: "Cancel",
            role: "cancel"
          }
        ]
      })
      .then(actionSheetElement => {
        actionSheetElement.present();
      });
  }

  openBookingModal(mode: "select" | "random") {
    console.log(mode);

    // open up as a modal
    this.modalController
      .create({
        component: CreateBookComponent,
        componentProps: {
          /* sending parameters */
          place: this.place,
          selectedMode: mode
        }
      })
      .then(modalElement => {
        modalElement.present();

        return modalElement.onDidDismiss(); // it returns a promise
      })
      .then(modalResult => {
        // subscriber of the promise above
        console.log(modalResult.data);
        console.log(modalResult.data.message);
        console.log(modalResult.data.bookedPlace);
        console.log(modalResult.data.bookedPlace.firstName);
        console.log(modalResult.role);

        if (modalResult.role === "confirm") {
          this.loadingCtrl
            .create({ message: "Booking place..." })
            .then(loadingEl => {
              loadingEl.present();
              const data = modalResult.data.bookedPlace;
              this.placeSubscription = this.bookingService
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.dateFrom,
                  data.dateTo
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                });
            });
        }
      });
  }

  ngOnInit() {
    this.activatedRouter.paramMap.subscribe(paramMap => {
      if (!paramMap) {
        this.navController.navigateBack("/places/tabs/search");
        return;
      }

      // this.place = this.placeService.getPlaceById(paramMap.get('placeId'));
      this.isLoading = true;
      this.placeSubscription = this.placeService
        .getPlaceById(paramMap.get("placeId"))
        .subscribe(places => {
          this.place = places;
          this.isLoading = false;
        }, error => {
          this.alertController.create({
            header: 'Error',
            message: 'Could not load',
            buttons: [{
              text: 'Okay',
              handler: () => {
                this.router.navigate(['/places/tabs/search']);
              }
            }]
          }).then( alertElement => {
            alertElement.present();
          } );
        });
    });
  }

  showMap() {
    this.modalController.create({
      component: MapModalComponent,
      componentProps: {
        center: {
          lat: this.place.location.lat,
          lng: this.place.location.lng
        },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address
      }
    }).then( modalElement => {
      modalElement.present();
    });
  }

  ngOnDestroy() {
    if (this.placeSubscription) {
      this.placeSubscription.unsubscribe();
    }
  }
}

import { Subscription } from "rxjs";
import { IonItemSliding, LoadingController } from "@ionic/angular";
import { BookingService } from "./booking.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Booking } from "./booking.model";

@Component({
  selector: "app-bookings",
  templateUrl: "./bookings.page.html",
  styleUrls: ["./bookings.page.scss"]
})
export class BookingsPage implements OnInit, OnDestroy {
  bookings: Booking[];
  private bookingSubscription: Subscription;
  isLoading = false;

  constructor(
    private bookingService: BookingService,
    private loaderController: LoadingController
  ) {}

  ngOnInit() {
    this.bookingSubscription = this.bookingService.bookings
      .asObservable()
      .subscribe(bookings => {
        console.log("bookings");
        console.log(bookings);
        console.log("this.bookings");
        console.log(this.bookings);
        this.bookings = bookings;
        console.log(this.bookings);
      });
  }

  ngOnDestroy() {
    if (this.bookingSubscription) {
      this.bookingSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe( () => {
      this.isLoading = false;
    });
  }

  onCancelBooking(bookingId: string, itemSlidingElement: IonItemSliding) {
    itemSlidingElement.close();

    this.loaderController
      .create({
        message: "Cancelling"
      })
      .then(loaderElement => {
        loaderElement.present();

        this.bookingSubscription = this.bookingService
          .cancelBooking(bookingId)
          .subscribe(() => {
            loaderElement.dismiss();
          });
      });
    console.log(bookingId);
  }
}

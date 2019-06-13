import { BookingService } from "./../booking.service";
import { ModalController, LoadingController } from "@ionic/angular";
import { Component, OnInit, Input, ViewChild, OnDestroy } from "@angular/core";
import { Place } from "../../places/places.model";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-create-book",
  templateUrl: "./create-book.component.html",
  styleUrls: ["./create-book.component.scss"]
})
export class CreateBookComponent implements OnInit, OnDestroy {
  @Input() place: Place;
  @Input() selectedMode: "select" | "random";
  @ViewChild("form") form: NgForm;
  startDate: string;
  endDate: string;
  private bookingSubscription: Subscription;

  ngOnInit() {
    const availableFrom = new Date(this.place.availableFrom);
    const availableTo = new Date(this.place.availableTo);
    if (this.selectedMode === 'random') {
      this.startDate = new Date(
        availableFrom.getTime() +
          Math.random() *
            (availableTo.getTime() -
              7 * 24 * 60 * 60 * 1000 -
              availableFrom.getTime())
      ).toISOString();

      this.endDate = new Date(
        new Date(this.startDate).getTime() +
          Math.random() *
            (new Date(this.startDate).getTime() +
              6 * 24 * 60 * 60 * 1000 -
              new Date(this.startDate).getTime())
      ).toISOString();
    }
  }

  constructor(
    private modalController: ModalController,
    private bookingService: BookingService,
    private loadingController: LoadingController
  ) {}

  onBookPlace() {
    if (!this.form.valid || !this.datesIsValid) {
      return;
    }

    this.modalController.dismiss(
      {
        message: "Place has been booked",
        bookedPlace: {
          firstName: this.form.value["firstName"],
          dateFrom: new Date(this.form.value["date-from"]),
          dateTo: new Date(this.form.value["date-to"]),
          lastName: this.form.value.lastName,
          guestNumber: +this.form.value["numberOfGuests"]
        }
      } /* data to send it back */,
      "confirm"
    );
  }

  datesIsValid() {
    const firstDate = new Date(this.form.value["date-from"]);
    const endDate = new Date(this.form.value["date-to"]);
    return endDate > firstDate;
  }

  onCancel() {
    this.modalController.dismiss(null /* data to send it back */, "cancel");
  }

  ngOnDestroy() {
    if (this.bookingSubscription) {
      this.bookingSubscription.unsubscribe();
    }
  }
}

import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Subscription } from "rxjs";
import { take, tap, switchMap, map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { Booking } from "./booking.model";
import { AuthService } from "../auth/auth.service";

interface BookingResponseData {
  placeId: string;
  placeTitle: string;
  placeImage: string;
  firstName: string;
  lastName: string;
  guestNumber: number;
  dateFrom: string;
  dateTo: string;
  userId: string;
}

@Injectable({
  providedIn: "root"
})
export class BookingService {
  /*private bookings: Booking[] = [
    {
      id: '1',
      guestNumber: 2,
      placeId: '1',
      placeTitle: 'Curitiba',
      userId: '1'
    }
  ];*/

  bookings = new BehaviorSubject<Booking[]>([]);
  generatedId: string;

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {}

  fetchBookings() {
    return this.httpClient
      .get<{
        [key: string]: BookingResponseData;
      }>(
        `https://ionic-project-udemy.firebaseio.com/bookings.json?orderBy="dateFrom"`
      )
      .pipe(
        map(responseData => {
          let listBookings = [];
          if (responseData) {
            for (let key in responseData) {
              if (responseData.hasOwnProperty(key)) {
                const newBooking: Booking = new Booking(
                  key,
                  responseData[key].placeId,
                  responseData[key].userId,
                  responseData[key].placeTitle,
                  +responseData[key].guestNumber,
                  responseData[key].placeImage,
                  responseData[key].firstName,
                  responseData[key].lastName,
                  new Date(responseData[key].dateFrom),
                  new Date(responseData[key].dateTo)
                );

                listBookings.push(newBooking);
              }
            }
          }

          return listBookings;
        }),
        take(1),
        tap(bookings => {
          this.bookings.next(bookings);
        })
      );
  }

  getBookings() {
    // return [...this.bookings];
    return this.bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const book = new Booking(
      Math.random.toString(),
      placeId,
      this.authService.getUserId(),
      placeTitle,
      guestNumber,
      placeImage,
      firstName,
      lastName,
      dateFrom,
      dateTo
    );

    console.log(book);

    return this.httpClient
      .post<{ id: string }>(
        "https://ionic-project-udemy.firebaseio.com/bookings.json",
        {
          ...book,
          id: null
        }
      )
      .pipe(
        switchMap(responseData => {
          this.generatedId = responseData.id;
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          book.id = this.generatedId;
          this.bookings.next(bookings.concat(book));
        })
      );
  }

  cancelBooking(bookingId: string) {
    return this.httpClient
      .delete(
        `https://ionic-project-udemy.firebaseio.com/bookings/${bookingId}.json`
      )
      .pipe(
        switchMap(responseData => {
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          this.bookings.next(
            bookings.filter(booking => booking.id !== bookingId)
          );
        })
      );
  }
}

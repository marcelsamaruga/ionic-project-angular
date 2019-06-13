import { PlaceLocation } from "../places/location.model";
import { AuthService } from "./../auth/auth.service";
import { Injectable } from "@angular/core";
import { Place } from "./places.model";
import { BehaviorSubject } from "rxjs";
import { map, take, delay, tap, switchMap } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { stringify } from "@angular/compiler/src/util";

interface PlaceResponseData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: "root"
})
export class PlacesService {
  private firebaseJson: string = "place.json";

  public places = new BehaviorSubject<Place[]>([]);

  getPlaces() {
    return this.places.asObservable();
  }

  getPlaceById(placeId: string) {
    return this.httpClient
      .get<PlaceResponseData>(
        `https://ionic-project-udemy.firebaseio.com/place/${placeId}.json`
      )
      .pipe(
        take(1),
        map(place => {
          console.log("place");
          console.log(place);
          return new Place(
            placeId,
            place.title,
            place.description,
            place.imageUrl,
            +place.price,
            new Date(place.availableFrom),
            new Date(place.availableTo),
            this.authService.getUserId(),
            place.location
          );
        })
      );
  }
  /*getPlaceById(placeId: string) {
    return this.places.pipe(
      take(1),
      map(places => {
        return { ...places.find(p => p.id === placeId) };
      })
    );
  }*/
  /*getPlaceById(placeId: string) {
    const placeObj = this.places.find(place => {
      return place.id === placeId;
    });

    return { ...placeObj };
  }*/

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {}

  fetchPlaces() {
    return this.httpClient
      .get<{
        [key: string]: PlaceResponseData;
      }>("https://ionic-project-udemy.firebaseio.com/" + this.firebaseJson)
      .pipe(
        map(response => {
          const places = [];
          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  response[key].title,
                  response[key].description,
                  response[key].imageUrl,
                  +response[key].price,
                  new Date(response[key].availableFrom),
                  new Date(response[key].availableTo),
                  response[key].userId,
                  response[key].location
                )
              );
            }
          }

          return places;
        }),
        tap(places => {
          this.places.next(places);
        })
      );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId = "";
    const newPlace = new Place(
      Math.random.toString(),
      title,
      description,
      imageUrl,
      price,
      dateFrom,
      dateTo,
      this.authService.getUserId(),
      location
    );

    return this.httpClient
      .post<{ id: string }>(
        "https://ionic-project-udemy.firebaseio.com/" + this.firebaseJson,
        {
          ...newPlace,
          id: null
        }
      )
      .pipe(
        // switchMap is a chain of observables
        switchMap(restData => {
          generatedId = restData.id;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this.places.next(places.concat(newPlace));
        })
      );

    /*return this.places.pipe(
      take(1),
      tap(places => {
        this.places.next(places.concat(newPlace));
      })
    );*/
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append("image", image);

    return this.httpClient.post<{ imageUrl: string; imagePath: string }>(
      "https://us-central1-ionic-project-udemy.cloudfunctions.net/storeImage",
      uploadData
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );

        return this.httpClient.put(
          `https://ionic-project-udemy.firebaseio.com/place/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(response => {
        this.places.next(updatedPlaces);
      })
    );
  }
}

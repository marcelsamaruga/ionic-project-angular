import { ModalController } from "@ionic/angular";
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
  Input
} from "@angular/core";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-map-modal",
  templateUrl: "./map-modal.component.html",
  styleUrls: ["./map-modal.component.scss"]
})
export class MapModalComponent implements OnInit, AfterViewInit {
  @ViewChild("map") mapElement: ElementRef;
  @Input() center = { lat: -25.42778, lng: -49.27306 };
  @Input() selectable = true;
  @Input() closeButtonText = "Cancel";
  @Input() title = "Pick Location";

  constructor(
    private modalController: ModalController,
    private renderer: Renderer2,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // initialize google maps
    this.getGoogleMaps()
      .then(googleMaps => {
        const mapEl = this.mapElement.nativeElement;
        const map = new googleMaps.Map(mapEl, {
          center: this.center,
          zoom: 16
        });

        googleMaps.event.addListenerOnce(map, "idle", () => {
          this.renderer.addClass(mapEl, "visible");
        });

        if (this.selectable) {
          map.addListener("click", event => {
            const selectedCoords = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };
            this.modalCtrl.dismiss(selectedCoords);
          });
        } else {
          const marker = new googleMaps.Marker({
            position: this.center,
            map: map,
            title: "Picked Location"
          });
          marker.setMap(map);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        environment.googleMapsAPIKey
      }`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject("Google maps SDK not available.");
        }
      };
    });
  }

  onCancel() {
    this.modalController.dismiss();
  }
}

/**
 * 
 * async getHeroes(): Promise<Hero[]> {
  try {
    let response = await this.http
      .get(this.heroesUrl)
      .toPromise();
    return response.json().data as Hero[];
  } catch (error) {
    await this.handleError(error);
  }
}
 */

export class Booking {
  constructor(
    public id: string,
    public placeId: string,
    public userId: string,
    public placeTitle: string,
    public guestNumber: number,
    public placeImage: string,
    public firstName: string,
    public lastName: string,
    public dateFrom: Date,
    public dateTo: Date
  ) {}
}

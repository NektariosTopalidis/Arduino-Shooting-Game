import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface bulletCoordinatesWithId{
  top: number;
  left: number;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class BulletService {

  private _bulletDone = new Subject<number>();

  get bulletDone(){
    return this._bulletDone.asObservable();
  }

  setBulletDone(id: number){
    this._bulletDone.next(id);
  }

  private _bulletPosition = new Subject<bulletCoordinatesWithId>();

  get bulletPosition(){
    return this._bulletPosition.asObservable();
  }

  setBulletPosition(coordinates: bulletCoordinatesWithId){
    this._bulletPosition.next(coordinates);
  }

  constructor() { }
}

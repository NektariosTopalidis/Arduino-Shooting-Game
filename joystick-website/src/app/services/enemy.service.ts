import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, tap } from 'rxjs';

interface playerCoordinates{
  top: number;
  left: number;
}

@Injectable({
  providedIn: 'root'
})
export class EnemyService {

  private _updateChaseCoordinates = new Subject<playerCoordinates>();

  get updateChaseCoordinates(){
    return this._updateChaseCoordinates.asObservable();
  }

  setCoordinates(coordinates: playerCoordinates){
    this._updateChaseCoordinates.next(coordinates);
  }

  private _hitPlayer = new Subject<boolean>();

  get hitPlayer(){
    return this._hitPlayer.asObservable();
  }

  setHitPlayer(flag: boolean){
    this._hitPlayer.next(flag);
  }

  private _gameEnd = new Subject<boolean>();

  get gameEnd(){
    return this._gameEnd.asObservable();
  }

  setGameEnd(flag: boolean){
    this._gameEnd.next(flag);
  }

  private _destroyBullet = new Subject<number>();

  get destroyBullet(){
    return this._destroyBullet.asObservable();
  }

  setDestroyBullet(id: number){
    this._destroyBullet.next(id);
  }

  private _killCount = new BehaviorSubject<number>(0);

  get killCount(){
    return this._killCount.asObservable();
  }

  updateKillCount(){
    let currentKillCount = this._killCount.value;
    let newKillCount = currentKillCount + 1;
    this._killCount.next(newKillCount);
  }


  constructor() { }
}

import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {


  constructor(private socket: Socket) {}

  getMoveData() {
    return this.socket.fromEvent('move_data');
  }
  
  getRotationData() {
    return this.socket.fromEvent('rotation');
  }

  sendLostLife(){
    this.socket.emit('lostLife','');
  }

  sendGameEnd(){
    this.socket.emit('gameEnd','');
  }

  sendKilledEnemy(){
    this.socket.emit('killedEnemy','');
  }

  sendWonGame(){
    this.socket.emit('wonGame', '');
  }


}

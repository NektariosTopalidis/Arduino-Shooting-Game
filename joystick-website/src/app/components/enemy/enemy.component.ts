import { AfterViewInit, Component, ElementRef, Input, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { EnemyService } from '../../services/enemy.service';
import { BulletService } from '../../services/bullet.service';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-enemy',
  standalone: true,
  imports: [],
  templateUrl: './enemy.component.html',
  styleUrl: './enemy.component.scss'
})
export class EnemyComponent implements AfterViewInit,OnDestroy{
  @ViewChild('enemy') enemy!: ElementRef;

  @Input('top') top!: number;
  @Input('left') left!: number;
  @Input('rotation') rotation!: number;
  @Input('heightBounds') heightBounds!: number;
  @Input('widthBounds') widthBounds!: number;

  x: number = 0;
  y: number = 0;
  hp: number = 100;
  speed: number = 10;
  intervalId: any;

  updatePlayerCoordinatesSubscription!: Subscription;
  bulletPositionSubscription!: Subscription;
  gameEndSubscription!: Subscription;

  constructor(private renderer: Renderer2, private enemyService: EnemyService,private bulletService: BulletService,private websocket: WebsocketService) { }

  ngAfterViewInit(): void {
    this.x = Math.random() * this.widthBounds;
    this.y = Math.random() * this.heightBounds;

    this.updatePlayerCoordinatesSubscription = this.enemyService.updateChaseCoordinates.subscribe(coordinates => {
      this.left = coordinates.left;
      this.top = coordinates.top;
    })

    this.intervalId = setInterval(() => {
      this.chasePlayer();
    }, 200);

    this.gameEndSubscription = this.enemyService.gameEnd.subscribe(flag => {
      this.destroy();
    })

    this.bulletPositionSubscription = this.bulletService.bulletPosition.subscribe(positionAndId => {
      const dx = positionAndId.left - this.x;
      const dy = positionAndId.top - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if(distance <= 15){
        this.enemyService.setDestroyBullet(positionAndId.id);
        this.takeDamage(25);        
      }
      
    })

  }

  chasePlayer() {
    const dx = this.left - this.x;
    const dy = this.top - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if(distance<=15){
      this.enemyService.setHitPlayer(true);
      this.destroy();
    }
    const vx = (dx / distance) * this.speed;
    const vy = (dy / distance) * this.speed;
    
    this.x += vx;
    this.y += vy;
    
    
    this.renderer.setStyle(this.enemy.nativeElement, 'left', `${this.x}px`);
    this.renderer.setStyle(this.enemy.nativeElement, 'top', `${this.y}px`);
  }

  takeDamage(damage: number) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.websocket.sendKilledEnemy();
      this.enemyService.updateKillCount();
      this.destroy();
    }
    else{
      this.renderer.setStyle(this.enemy.nativeElement, 'background-image', "url('../../../assets/red ghost.png')");
      setTimeout(() => {
        this.renderer.setStyle(this.enemy.nativeElement, 'background-image', "url('../../../assets/blue ghost.png')");
      },600)
    }
  }

  destroy() {
    clearInterval(this.intervalId);
    const enemyElement = this.enemy.nativeElement.parentNode;
    enemyElement.parentNode.removeChild(enemyElement);
    this.ngOnDestroy();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    if(this.updatePlayerCoordinatesSubscription) this.updatePlayerCoordinatesSubscription.unsubscribe();
    if(this.gameEndSubscription) this.gameEndSubscription.unsubscribe();
    if(this.bulletPositionSubscription) this.bulletPositionSubscription.unsubscribe();
  }
}

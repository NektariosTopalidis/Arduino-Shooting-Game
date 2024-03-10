import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, OnDestroy, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './services/websocket.service';
import { Subscription, TimeInterval, timeInterval } from 'rxjs';
import { BulletComponent } from './components/bullet/bullet.component';
import { BulletService } from './services/bullet.service';
import { EnemyComponent } from './components/enemy/enemy.component';
import { EnemyService } from './services/enemy.service';

interface componentArrayData{
  component: any,
  id: number;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BulletComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit,OnDestroy{
  title = 'joystick-website';

  @ViewChild('player') player!: ElementRef;
  @ViewChild('bullets', {read: ViewContainerRef}) bullets!: ViewContainerRef;
  @ViewChild('enemies', {read: ViewContainerRef}) enemies!: ViewContainerRef;

  browserWidth: number = window.innerWidth;
  browserHeight: number = window.innerHeight;

  wsMoveDataSubscription!: Subscription;
  wsRotationDataSubscription!: Subscription;
  bulletInterval!: any;
  enemyInterval!: any;

  bulletComponentClass = BulletComponent;
  enemyComponentClass = EnemyComponent;

  bulletId: number = 0;

  disableMoving: boolean = false;

  lives: Array<boolean> = [true,true,true];
  lastPositionOfLife: number = 2;
  hitPlayerSubscription!: Subscription;
  killCountSubscription!: Subscription;

  gameRunning: boolean = true;
  killCount: number = 0;

  constructor(private websocket: WebsocketService,private renderer: Renderer2,private componentFactoryResolver: ComponentFactoryResolver,private enemyService: EnemyService){}


  ngAfterViewInit(): void {
    let top = +getComputedStyle(this.player.nativeElement).top.split('px')[0];
    let left = +getComputedStyle(this.player.nativeElement).left.split('px')[0];
    let rotation = 0;
    let heightBounds = (this.browserHeight * 0.6) - 60;
    let widthBounds = (this.browserWidth * 0.6) - 80;

    this.wsMoveDataSubscription = this.websocket.getMoveData().subscribe(moveData => {
      // console.log(moveData);
      if(!this.disableMoving){
        if(moveData === 'UP' && top-20>0){
          top -= 20;
          this.renderer.setStyle(this.player.nativeElement,'top', top + 'px');
        }
        if(moveData === 'DOWN' && top-20<heightBounds){
          top += 20;
          this.renderer.setStyle(this.player.nativeElement,'top', top + 'px');
        }
        if(moveData === 'LEFT' && left-20>0){
          left -= 20;
          this.renderer.setStyle(this.player.nativeElement,'left', left + 'px');
        }
        if(moveData === 'RIGHT' && left-20<widthBounds){
          left += 20;
          this.renderer.setStyle(this.player.nativeElement,'left', left + 'px');
        }

        let coordinates = {
          top: top,
          left: left
        };

        this.enemyService.setCoordinates(coordinates);
      }
    });

    this.wsRotationDataSubscription = this.websocket.getRotationData().subscribe(rotationData => {
      rotation = +rotationData!;
      // console.log(rotation);
      
      if(rotation >= 0 && rotation <= 360){
        this.renderer.setStyle(this.player.nativeElement,'transform',`rotate(${rotation}deg)`);
      }
      
    })

    this.bulletInterval = setInterval(() => {
      this.disableMoving = true;
      this.addComponent(this.bulletComponentClass,top,left,heightBounds,widthBounds,rotation);
      this.disableMoving = false;
    },800);

    this.addComponent(this.enemyComponentClass,top,left,heightBounds,widthBounds);
    this.enemyInterval = setInterval(() => {
      this.addComponent(this.enemyComponentClass,top,left,heightBounds,widthBounds);
    },10000)

    this.hitPlayerSubscription = this.enemyService.hitPlayer.subscribe(flag => {
      this.lives[this.lastPositionOfLife] = false;
      this.lastPositionOfLife--;
      if(this.lastPositionOfLife === -1){
        this.gameRunning = false;
        this.websocket.sendGameEnd();
        this.enemyService.setGameEnd(true);
        this.ngOnDestroy();
      }
      else{
        this.websocket.sendLostLife();
      }
    })

    this.killCountSubscription = this.enemyService.killCount.subscribe(currentKillCount => {
      this.killCount = currentKillCount;
      if(this.killCount === 10){
        this.gameRunning = false;
        this.websocket.sendWonGame();
        this.enemyService.setGameEnd(true);
        this.ngOnDestroy();
      }
    })

  }

  restart(){
    location.reload();
  }

  private addComponent(componentClass: any,top: number,left: number,heightBounds: number,widthBounds: number,rotation?: number) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    let component;
    if(componentFactory.selector === 'app-bullet'){
      component = this.bullets.createComponent(componentFactory);
      
      component.setInput('id',this.bulletId);
      component.setInput('top',top);
      component.setInput('left',left);
      component.setInput('rotation',(-rotation!));
      component.setInput('heightBounds',heightBounds+60);
      component.setInput('widthBounds',widthBounds+80);

      this.bulletId++;
    }
    else{
      component = this.enemies.createComponent(componentFactory);
      
      component.setInput('top',top);
      component.setInput('left',left);
      component.setInput('heightBounds',heightBounds+60);
      component.setInput('widthBounds',widthBounds+80);
    }
  }

  ngOnDestroy(): void { 
    clearInterval(this.bulletInterval);
    clearInterval(this.enemyInterval);
    if(this.hitPlayerSubscription) this.hitPlayerSubscription.unsubscribe();
    if(this.wsMoveDataSubscription) this.wsMoveDataSubscription.unsubscribe();
    if(this.wsRotationDataSubscription) this.wsRotationDataSubscription.unsubscribe();
  }
}

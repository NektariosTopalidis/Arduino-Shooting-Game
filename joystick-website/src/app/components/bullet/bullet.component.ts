  import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';
import { BulletService } from '../../services/bullet.service';
import { Subscription } from 'rxjs';
import { EnemyService } from '../../services/enemy.service';

  @Component({
    selector: 'app-bullet',
    standalone: true,
    imports: [],
    templateUrl: './bullet.component.html',
    styleUrl: './bullet.component.scss',
  })
  export class BulletComponent implements AfterViewInit,OnDestroy{
    @ViewChild('bullet') bullet!: ElementRef

    @Input('id') id!: number;
    @Input('top') top!: number;
    @Input('left') left!: number;
    @Input('rotation') rotation!: number;
    @Input('heightBounds') heightBounds!: number;
    @Input('widthBounds') widthBounds!: number;
    
    bulletTravelInterval!: any;
    done: boolean = false;
    speed: number = 10;

    bulletHitEnemySubscription!: Subscription;

    constructor(private renderer: Renderer2,private bulletService: BulletService,private enemyService: EnemyService){}

    
    ngAfterViewInit(): void {
      this.top+=4;
      this.left+=8;
      this.renderer.setStyle(this.bullet.nativeElement,'top',`${this.top}px`);
      this.renderer.setStyle(this.bullet.nativeElement,'left',`${this.left}px`);  

      this.bulletHitEnemySubscription = this.enemyService.destroyBullet.subscribe(id => {
        if(id === this.id) this.removeBullet();
      })

      this.bulletTravelInterval = setInterval(() => {
        if(!this.done){
          this.updatePosition();
        }
      },50)
    }

    updatePosition() {
      const angleInRadians = this.rotation * Math.PI / 180;

      const newX = this.left + Math.cos(angleInRadians) * this.speed;
      const newY = this.top - Math.sin(angleInRadians) * this.speed;

      const checkX = newX >= 0 && newX <=this.widthBounds+100; 
      const checkY = newY >= 0 && newY <= this.heightBounds+100;


      if (checkX && checkY) {
        this.left = newX;
        this.top = newY;

        this.renderer.setStyle(this.bullet.nativeElement, 'left', `${this.left}px`);
        this.renderer.setStyle(this.bullet.nativeElement, 'top', `${this.top}px`);
        
        this.bulletService.setBulletPosition({top: this.top,left: this.left,id: this.id});  
      }
      else{
        this.removeBullet();
      }


    }

    removeBullet() {
      const bulletElement = this.bullet.nativeElement.parentNode;
      bulletElement.parentNode.removeChild(bulletElement);
      this.ngOnDestroy();
    }

    ngOnDestroy(): void {
      clearInterval(this.bulletTravelInterval);
      if(this.bulletHitEnemySubscription) this.bulletHitEnemySubscription.unsubscribe();
    }
  }

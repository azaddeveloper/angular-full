import { Component } from '@angular/core';

@Component ({
   selector: 'footer-layout',
   templateUrl: './footer.component.html',
   styleUrls: ['./footer.component.css']
   
})

export class FooterComponent  {
   today: number = Date.now();
    constructor(){
    }
    
}
import {Component, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'main',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./main.css').toString()],
  template: `
    <button [routerLink]="['build']"><span class="align-center">Start Building</span></button>`
})

export class MainComponent {
  constructor(private router: Router) {}
}

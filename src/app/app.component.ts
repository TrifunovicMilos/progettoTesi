import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { routeTransition, slideInAnimation } from './animations';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    routeTransition,
    slideInAnimation
  ]
})
export class AppComponent {
  title = 'progettoTesi';

}

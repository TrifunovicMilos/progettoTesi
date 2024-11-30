import { animate, group, query, style, transition, trigger } from "@angular/animations";

export const routeTransition = trigger('routeTransition', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({ position: 'absolute', width: '100%' })
      ], { optional: true }),
  
      // L'elemento in entrata parte dal centro (zoom out)
      query(':enter', [
        style({ transform: 'scale(0)', opacity: 0 })
      ], { optional: true }),
  
      group([
        // L'elemento in uscita scompare immediatamente
        query(':leave', [
          style({ opacity: 0 })
        ], { optional: true }),
  
        // L'elemento in entrata si ingrandisce e appare gradualmente
        query(':enter', [
          animate('0.5s ease-out', style({ transform: 'scale(1)', opacity: 1 }))
        ], { optional: true })
      ])
    ])
  ]);

  export const slideInAnimation = trigger('slideInAnimation', [

    transition('* <=> *', [
      query(':enter, :leave', style({ position: 'fixed', width: '100%', zIndex: 2 }), { optional: true }),
      group([
        query(':enter', [
          style({ transform: 'translateX(100%)' }),
          animate('0.5s ease-out', style({ transform: 'translateX(0%)' }))
        ], { optional: true }),
        query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-out', style({ transform: 'translateX(-100%)' }))
        ], { optional: true })
      ])
    ])
  ]);
import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITicket, Ticket } from '../ticket.model';
import { TicketService } from '../service/ticket.service';

@Injectable({ providedIn: 'root' })
export class TicketRoutingResolveService implements Resolve<ITicket> {
  constructor(protected service: TicketService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ITicket> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((ticket: HttpResponse<Ticket>) => {
          if (ticket.body) {
            return of(ticket.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Ticket());
  }
}

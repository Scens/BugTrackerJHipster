import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { TicketComponent } from '../list/ticket.component';
import { TicketDetailComponent } from '../detail/ticket-detail.component';
import { TicketUpdateComponent } from '../update/ticket-update.component';
import { TicketRoutingResolveService } from './ticket-routing-resolve.service';

const ticketRoute: Routes = [
  {
    path: '',
    component: TicketComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: TicketDetailComponent,
    resolve: {
      ticket: TicketRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: TicketUpdateComponent,
    resolve: {
      ticket: TicketRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: TicketUpdateComponent,
    resolve: {
      ticket: TicketRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ticketRoute)],
  exports: [RouterModule],
})
export class TicketRoutingModule {}

jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { ITicket, Ticket } from '../ticket.model';
import { TicketService } from '../service/ticket.service';

import { TicketRoutingResolveService } from './ticket-routing-resolve.service';

describe('Ticket routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: TicketRoutingResolveService;
  let service: TicketService;
  let resultTicket: ITicket | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(TicketRoutingResolveService);
    service = TestBed.inject(TicketService);
    resultTicket = undefined;
  });

  describe('resolve', () => {
    it('should return ITicket returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultTicket = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultTicket).toEqual({ id: 123 });
    });

    it('should return new ITicket if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultTicket = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultTicket).toEqual(new Ticket());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as Ticket })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultTicket = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultTicket).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});

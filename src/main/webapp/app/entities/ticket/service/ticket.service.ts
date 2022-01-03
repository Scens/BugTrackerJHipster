import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITicket, getTicketIdentifier } from '../ticket.model';

export type EntityResponseType = HttpResponse<ITicket>;
export type EntityArrayResponseType = HttpResponse<ITicket[]>;

@Injectable({ providedIn: 'root' })
export class TicketService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/tickets');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(ticket: ITicket): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(ticket);
    return this.http
      .post<ITicket>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(ticket: ITicket): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(ticket);
    return this.http
      .put<ITicket>(`${this.resourceUrl}/${getTicketIdentifier(ticket) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(ticket: ITicket): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(ticket);
    return this.http
      .patch<ITicket>(`${this.resourceUrl}/${getTicketIdentifier(ticket) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<ITicket>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ITicket[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addTicketToCollectionIfMissing(ticketCollection: ITicket[], ...ticketsToCheck: (ITicket | null | undefined)[]): ITicket[] {
    const tickets: ITicket[] = ticketsToCheck.filter(isPresent);
    if (tickets.length > 0) {
      const ticketCollectionIdentifiers = ticketCollection.map(ticketItem => getTicketIdentifier(ticketItem)!);
      const ticketsToAdd = tickets.filter(ticketItem => {
        const ticketIdentifier = getTicketIdentifier(ticketItem);
        if (ticketIdentifier == null || ticketCollectionIdentifiers.includes(ticketIdentifier)) {
          return false;
        }
        ticketCollectionIdentifiers.push(ticketIdentifier);
        return true;
      });
      return [...ticketsToAdd, ...ticketCollection];
    }
    return ticketCollection;
  }

  queryMyTickets(): Observable<EntityArrayResponseType> {
    const options = createRequestOption();
    return this.http
      .get<ITicket[]>(this.resourceUrl + '/self', { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  protected convertDateFromClient(ticket: ITicket): ITicket {
    return Object.assign({}, ticket, {
      dueDate: ticket.dueDate?.isValid() ? ticket.dueDate.format(DATE_FORMAT) : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dueDate = res.body.dueDate ? dayjs(res.body.dueDate) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((ticket: ITicket) => {
        ticket.dueDate = ticket.dueDate ? dayjs(ticket.dueDate) : undefined;
      });
    }
    return res;
  }
}

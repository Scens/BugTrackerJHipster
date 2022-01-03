import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ITicket } from '../ticket.model';
import { TicketService } from '../service/ticket.service';

@Component({
  templateUrl: './ticket-delete-dialog.component.html',
})
export class TicketDeleteDialogComponent {
  ticket?: ITicket;

  constructor(protected ticketService: TicketService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.ticketService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}

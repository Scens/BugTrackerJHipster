import { ITicket } from 'app/entities/ticket/ticket.model';

export interface ILabel {
  id?: number;
  label?: string | null;
  tickets?: ITicket[] | null;
}

export class Label implements ILabel {
  constructor(public id?: number, public label?: string | null, public tickets?: ITicket[] | null) {}
}

export function getLabelIdentifier(label: ILabel): number | undefined {
  return label.id;
}

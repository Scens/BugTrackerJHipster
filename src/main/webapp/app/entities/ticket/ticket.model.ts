import * as dayjs from 'dayjs';
import { IProject } from 'app/entities/project/project.model';
import { IUser } from 'app/entities/user/user.model';
import { ILabel } from 'app/entities/label/label.model';

export interface ITicket {
  id?: number;
  title?: string;
  description?: string | null;
  dueDate?: dayjs.Dayjs | null;
  done?: boolean | null;
  project?: IProject | null;
  assignedTo?: IUser | null;
  labels?: ILabel[] | null;
}

export class Ticket implements ITicket {
  constructor(
    public id?: number,
    public title?: string,
    public description?: string | null,
    public dueDate?: dayjs.Dayjs | null,
    public done?: boolean | null,
    public project?: IProject | null,
    public assignedTo?: IUser | null,
    public labels?: ILabel[] | null
  ) {
    this.done = this.done ?? false;
  }
}

export function getTicketIdentifier(ticket: ITicket): number | undefined {
  return ticket.id;
}

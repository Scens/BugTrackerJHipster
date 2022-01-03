import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ITicket, Ticket } from '../ticket.model';
import { TicketService } from '../service/ticket.service';
import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { ILabel } from 'app/entities/label/label.model';
import { LabelService } from 'app/entities/label/service/label.service';

@Component({
  selector: 'jhi-ticket-update',
  templateUrl: './ticket-update.component.html',
})
export class TicketUpdateComponent implements OnInit {
  isSaving = false;

  projectsSharedCollection: IProject[] = [];
  usersSharedCollection: IUser[] = [];
  labelsSharedCollection: ILabel[] = [];

  editForm = this.fb.group({
    id: [],
    title: [null, [Validators.required]],
    description: [],
    dueDate: [],
    done: [],
    project: [],
    assignedTo: [],
    labels: [],
  });

  constructor(
    protected ticketService: TicketService,
    protected projectService: ProjectService,
    protected userService: UserService,
    protected labelService: LabelService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ ticket }) => {
      this.updateForm(ticket);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const ticket = this.createFromForm();
    if (ticket.id !== undefined) {
      this.subscribeToSaveResponse(this.ticketService.update(ticket));
    } else {
      this.subscribeToSaveResponse(this.ticketService.create(ticket));
    }
  }

  trackProjectById(index: number, item: IProject): number {
    return item.id!;
  }

  trackUserById(index: number, item: IUser): number {
    return item.id!;
  }

  trackLabelById(index: number, item: ILabel): number {
    return item.id!;
  }

  getSelectedLabel(option: ILabel, selectedVals?: ILabel[]): ILabel {
    if (selectedVals) {
      for (const selectedVal of selectedVals) {
        if (option.id === selectedVal.id) {
          return selectedVal;
        }
      }
    }
    return option;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITicket>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(ticket: ITicket): void {
    this.editForm.patchValue({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      dueDate: ticket.dueDate,
      done: ticket.done,
      project: ticket.project,
      assignedTo: ticket.assignedTo,
      labels: ticket.labels,
    });

    this.projectsSharedCollection = this.projectService.addProjectToCollectionIfMissing(this.projectsSharedCollection, ticket.project);
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing(this.usersSharedCollection, ticket.assignedTo);
    this.labelsSharedCollection = this.labelService.addLabelToCollectionIfMissing(this.labelsSharedCollection, ...(ticket.labels ?? []));
  }

  protected loadRelationshipsOptions(): void {
    this.projectService
      .query()
      .pipe(map((res: HttpResponse<IProject[]>) => res.body ?? []))
      .pipe(
        map((projects: IProject[]) => this.projectService.addProjectToCollectionIfMissing(projects, this.editForm.get('project')!.value))
      )
      .subscribe((projects: IProject[]) => (this.projectsSharedCollection = projects));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing(users, this.editForm.get('assignedTo')!.value)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));

    this.labelService
      .query()
      .pipe(map((res: HttpResponse<ILabel[]>) => res.body ?? []))
      .pipe(
        map((labels: ILabel[]) => this.labelService.addLabelToCollectionIfMissing(labels, ...(this.editForm.get('labels')!.value ?? [])))
      )
      .subscribe((labels: ILabel[]) => (this.labelsSharedCollection = labels));
  }

  protected createFromForm(): ITicket {
    return {
      ...new Ticket(),
      id: this.editForm.get(['id'])!.value,
      title: this.editForm.get(['title'])!.value,
      description: this.editForm.get(['description'])!.value,
      dueDate: this.editForm.get(['dueDate'])!.value,
      done: this.editForm.get(['done'])!.value,
      project: this.editForm.get(['project'])!.value,
      assignedTo: this.editForm.get(['assignedTo'])!.value,
      labels: this.editForm.get(['labels'])!.value,
    };
  }
}

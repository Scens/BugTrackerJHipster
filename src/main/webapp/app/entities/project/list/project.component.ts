import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IProject } from '../project.model';
import { ProjectService } from '../service/project.service';
import { ProjectDeleteDialogComponent } from '../delete/project-delete-dialog.component';

@Component({
  selector: 'jhi-project',
  templateUrl: './project.component.html',
})
export class ProjectComponent implements OnInit {
  projects?: IProject[];
  isLoading = false;

  constructor(protected projectService: ProjectService, protected modalService: NgbModal) {}

  loadAll(): void {
    this.isLoading = true;

    this.projectService.query().subscribe(
      (res: HttpResponse<IProject[]>) => {
        this.isLoading = false;
        this.projects = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IProject): number {
    return item.id!;
  }

  delete(project: IProject): void {
    const modalRef = this.modalService.open(ProjectDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.project = project;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }
}

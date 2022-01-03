import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ProjectService } from '../service/project.service';

import { ProjectComponent } from './project.component';

describe('Project Management Component', () => {
  let comp: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let service: ProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ProjectComponent],
    })
      .overrideTemplate(ProjectComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ProjectComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(ProjectService);

    const headers = new HttpHeaders();
    jest.spyOn(service, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [{ id: 123 }],
          headers,
        })
      )
    );
  });

  it('Should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.projects?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { TicketDetailComponent } from './ticket-detail.component';

describe('Ticket Management Detail Component', () => {
  let comp: TicketDetailComponent;
  let fixture: ComponentFixture<TicketDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ ticket: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(TicketDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(TicketDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load ticket on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.ticket).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});

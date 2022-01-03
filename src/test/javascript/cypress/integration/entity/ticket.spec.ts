import { entityItemSelector } from '../../support/commands';
import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityCreateCancelButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('Ticket e2e test', () => {
  const ticketPageUrl = '/ticket';
  const ticketPageUrlPattern = new RegExp('/ticket(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'admin';
  const password = Cypress.env('E2E_PASSWORD') ?? 'admin';
  const ticketSample = { title: 'Granite Fresh' };

  let ticket: any;

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear();
    });
    cy.visit('');
    cy.login(username, password);
    cy.get(entityItemSelector).should('exist');
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/tickets+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/tickets').as('postEntityRequest');
    cy.intercept('DELETE', '/api/tickets/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (ticket) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/tickets/${ticket.id}`,
      }).then(() => {
        ticket = undefined;
      });
    }
  });

  it('Tickets menu should load Tickets page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('ticket');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response!.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Ticket').should('exist');
    cy.url().should('match', ticketPageUrlPattern);
  });

  describe('Ticket page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(ticketPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Ticket page', () => {
        cy.get(entityCreateButtonSelector).click({ force: true });
        cy.url().should('match', new RegExp('/ticket/new$'));
        cy.getEntityCreateUpdateHeading('Ticket');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click({ force: true });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', ticketPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/tickets',
          body: ticketSample,
        }).then(({ body }) => {
          ticket = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/tickets+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [ticket],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(ticketPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Ticket page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('ticket');
        cy.get(entityDetailsBackButtonSelector).click({ force: true });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', ticketPageUrlPattern);
      });

      it('edit button click should load edit Ticket page', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Ticket');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click({ force: true });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', ticketPageUrlPattern);
      });

      it('last delete button click should delete instance of Ticket', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('ticket').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click({ force: true });
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', ticketPageUrlPattern);

        ticket = undefined;
      });
    });
  });

  describe('new Ticket page', () => {
    beforeEach(() => {
      cy.visit(`${ticketPageUrl}`);
      cy.get(entityCreateButtonSelector).click({ force: true });
      cy.getEntityCreateUpdateHeading('Ticket');
    });

    it('should create an instance of Ticket', () => {
      cy.get(`[data-cy="title"]`).type('FTP Uruguay SMTP').should('have.value', 'FTP Uruguay SMTP');

      cy.get(`[data-cy="description"]`).type('Guarani Palladium Sleek').should('have.value', 'Guarani Palladium Sleek');

      cy.get(`[data-cy="dueDate"]`).type('2022-01-02').should('have.value', '2022-01-02');

      cy.get(`[data-cy="done"]`).should('not.be.checked');
      cy.get(`[data-cy="done"]`).click().should('be.checked');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response!.statusCode).to.equal(201);
        ticket = response!.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response!.statusCode).to.equal(200);
      });
      cy.url().should('match', ticketPageUrlPattern);
    });
  });
});

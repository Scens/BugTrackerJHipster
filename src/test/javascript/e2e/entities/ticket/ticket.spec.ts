import { browser, ExpectedConditions as ec, promise } from 'protractor';
import { NavBarPage, SignInPage } from '../../page-objects/jhi-page-objects';

import { TicketComponentsPage, TicketDeleteDialog, TicketUpdatePage } from './ticket.page-object';

const expect = chai.expect;

describe('Ticket e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let ticketComponentsPage: TicketComponentsPage;
  let ticketUpdatePage: TicketUpdatePage;
  let ticketDeleteDialog: TicketDeleteDialog;
  const username = process.env.E2E_USERNAME ?? 'admin';
  const password = process.env.E2E_PASSWORD ?? 'admin';

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.autoSignInUsing(username, password);
    await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
  });

  it('should load Tickets', async () => {
    await navBarPage.goToEntity('ticket');
    ticketComponentsPage = new TicketComponentsPage();
    await browser.wait(ec.visibilityOf(ticketComponentsPage.title), 5000);
    expect(await ticketComponentsPage.getTitle()).to.eq('bugTrackerJHipsterApp.ticket.home.title');
    await browser.wait(ec.or(ec.visibilityOf(ticketComponentsPage.entities), ec.visibilityOf(ticketComponentsPage.noResult)), 1000);
  });

  it('should load create Ticket page', async () => {
    await ticketComponentsPage.clickOnCreateButton();
    ticketUpdatePage = new TicketUpdatePage();
    expect(await ticketUpdatePage.getPageTitle()).to.eq('bugTrackerJHipsterApp.ticket.home.createOrEditLabel');
    await ticketUpdatePage.cancel();
  });

  it('should create and save Tickets', async () => {
    const nbButtonsBeforeCreate = await ticketComponentsPage.countDeleteButtons();

    await ticketComponentsPage.clickOnCreateButton();

    await promise.all([
      ticketUpdatePage.setTitleInput('title'),
      ticketUpdatePage.setDescriptionInput('description'),
      ticketUpdatePage.setDueDateInput('2000-12-31'),
      ticketUpdatePage.getDoneInput().click(),
      ticketUpdatePage.projectSelectLastOption(),
      ticketUpdatePage.assignedToSelectLastOption(),
      // ticketUpdatePage.labelSelectLastOption(),
    ]);

    await ticketUpdatePage.save();
    expect(await ticketUpdatePage.getSaveButton().isPresent(), 'Expected save button disappear').to.be.false;

    expect(await ticketComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1, 'Expected one more entry in the table');
  });

  it('should delete last Ticket', async () => {
    const nbButtonsBeforeDelete = await ticketComponentsPage.countDeleteButtons();
    await ticketComponentsPage.clickOnLastDeleteButton();

    ticketDeleteDialog = new TicketDeleteDialog();
    expect(await ticketDeleteDialog.getDialogTitle()).to.eq('bugTrackerJHipsterApp.ticket.delete.question');
    await ticketDeleteDialog.clickOnConfirmButton();
    await browser.wait(ec.visibilityOf(ticketComponentsPage.title), 5000);

    expect(await ticketComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});

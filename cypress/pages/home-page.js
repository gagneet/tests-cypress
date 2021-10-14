const baseUrl = Cypress.env().baseUrl + '/home';

export const homePageModel = {
  url: baseUrl,
  avatarIcon: '[class="user__avatar"]',
  profileButton: ':nth-child(2) > .plt__menuitem', // click on profile button
  createChange: '[name="AvatarFile"]', //click on change avatar
  phoneNum: '[name="PhoneNumber"]', // clears current phone number
  saveClose: 'Save & Close',
  helpButton:':nth-child(4) > .plt__menuitem',
  logout: 'Logout',
  login: '[value="Login"]',
  recentItems: '.plt__l--History',
  item: '[class="plt__menuitem plt__navbar__nav__panel__actions__recentItems__menu__item"]',
  description: '[data-placeholder="Enter description"]',
  decimal: '[class="plt__additionalinformation__fields__field "]'
};

export const commonPageModel = {
  searchButton: 'Search',
  clearButton: 'Clear',
  editButton: 'Edit',
  searchInput: '[placeholder^="Live Search"]',
  gridCheckbox: '.x-column-header-checkbox',
  gridEmtpyMap: '[class="x-grid-empty"]',
  navBar: '[class="plt__navbar__nav__panel__container__menu"]'
};
// Import utils
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';
import {
  boDashboardPage,
  boModuleManagerPage,
  dataCategories,
  dataModules,
  foClassicCategoryPage,
  foClassicHomePage,
  utilsFile,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';

const baseContext: string = 'modules_ps_facetedsearch_installation_uninstallAndDeleteModule';

describe('Faceted search module - Uninstall and delete module', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  // before and after functions
  before(async function () {
    browserContext = await utilsPlaywright.createBrowserContext(this.browser);
    page = await utilsPlaywright.newTab(browserContext);
  });

  after(async () => {
    await utilsPlaywright.closeBrowserContext(browserContext);
    await utilsFile.deleteFile('module.zip');
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  it('should go to \'Modules > Module Manager\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToModuleManagerPage', baseContext);

    await boDashboardPage.goToSubMenu(
      page,
      boDashboardPage.modulesParentLink,
      boDashboardPage.moduleManagerLink,
    );
    await boModuleManagerPage.closeSfToolBar(page);

    const pageTitle = await boModuleManagerPage.getPageTitle(page);
    expect(pageTitle).to.contains(boModuleManagerPage.pageTitle);
  });

  it(`should search the module ${dataModules.psFacetedSearch.name}`, async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'searchModule', baseContext);

    const isModuleVisible = await boModuleManagerPage.searchModule(page, dataModules.psFacetedSearch);
    expect(isModuleVisible).to.eq(true);
  });

  it('should display the uninstall modal and cancel it', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetModuleAndCancel', baseContext);

    const textResult = await boModuleManagerPage.setActionInModule(page, dataModules.psFacetedSearch, 'uninstall', true);
    expect(textResult).to.eq('');

    const isModuleVisible = await boModuleManagerPage.isModuleVisible(page, dataModules.psFacetedSearch);
    expect(isModuleVisible).to.eq(true);

    const isModalVisible = await boModuleManagerPage.isModalActionVisible(page, dataModules.psFacetedSearch, 'uninstall');
    expect(isModalVisible).to.eq(false);

    const dirExists = await utilsFile.doesFileExist(`${utilsFile.getRootPath()}/modules/${dataModules.psFacetedSearch.tag}/`);
    expect(dirExists).to.eq(true);
  });

  it('should uninstall the module', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetModule', baseContext);

    const successMessage = await boModuleManagerPage.setActionInModule(
      page,
      dataModules.psFacetedSearch,
      'uninstall',
      false,
      true,
    );
    expect(successMessage).to.eq(boModuleManagerPage.uninstallModuleSuccessMessage(dataModules.psFacetedSearch.tag));

    // Check the directory `modules/dataModules.psFacetedSearch.tag`
    const dirExists = await utilsFile.doesFileExist(`${utilsFile.getRootPath()}/modules/${dataModules.psFacetedSearch.tag}/`);
    expect(dirExists).to.eq(false);
  });

  it('should go to Front Office', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToFo', baseContext);

    page = await boModuleManagerPage.viewMyShop(page);
    await foClassicHomePage.changeLanguage(page, 'en');

    const isHomePage = await foClassicHomePage.isHomePage(page);
    expect(isHomePage).to.eq(true);
  });

  it('should go to the category Page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCategoryPage', baseContext);

    await foClassicHomePage.goToCategory(page, dataCategories.clothes.id);

    const pageTitle = await foClassicHomePage.getPageTitle(page);
    expect(pageTitle).to.equal(dataCategories.clothes.name);
  });

  it(`should check that ${dataModules.psFacetedSearch.name} is not present`, async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'checkModuleNotPresent', baseContext);

    const hasFilters = await foClassicCategoryPage.hasSearchFilters(page);
    expect(hasFilters).to.eq(false);
  });

  describe(`POST-CONDITION : Install the module ${dataModules.psFacetedSearch.name}`, async () => {
    it('should go back to Back Office', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'returnToBo', baseContext);

      page = await foClassicCategoryPage.closePage(browserContext, page, 0);

      const pageTitle = await boModuleManagerPage.getPageTitle(page);
      expect(pageTitle).to.contains(boModuleManagerPage.pageTitle);
    });

    it(`should download the zip of the module '${dataModules.psFacetedSearch.name}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'downloadModule', baseContext);

      await utilsFile.downloadFile(dataModules.psFacetedSearch.releaseZip, 'module.zip');

      const found = await utilsFile.doesFileExist('module.zip');
      expect(found).to.eq(true);
    });

    it(`should upload the module '${dataModules.psFacetedSearch.name}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'uploadModule', baseContext);

      const successMessage = await boModuleManagerPage.uploadModule(page, 'module.zip');
      expect(successMessage).to.eq(boModuleManagerPage.uploadModuleSuccessMessage);
    });

    it('should close upload module modal', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'closeModal', baseContext);

      const isModalNotVisible = await boModuleManagerPage.closeUploadModuleModal(page);
      expect(isModalNotVisible).to.eq(true);
    });

    it(`should search the module '${dataModules.psFacetedSearch.name}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkModulePresent', baseContext);

      const isModuleVisible = await boModuleManagerPage.searchModule(page, dataModules.psFacetedSearch);
      expect(isModuleVisible, 'Module is not visible!').to.eq(true);
    });
  });
});

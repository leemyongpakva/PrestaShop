// Import utils
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';
import {
  boDashboardPage,
  boModuleManagerPage,
  boThemeAndLogoPage,
  dataModules,
  utilsFile,
  utilsPlaywright,
} from '@prestashop-core/ui-testing';
import { installModule } from '@commonTests/BO/modules/moduleManager';

const baseContext: string = 'modules_ps_themecusto_installation_uninstallAndDeleteModule';

describe('Theme Customization module - Uninstall and delete module', async () => {
  describe('Uninstall and delete module', async () => {
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

    it(`should search the module ${dataModules.psThemeCusto.name}`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'searchModule', baseContext);

      const isModuleVisible = await boModuleManagerPage.searchModule(page, dataModules.psThemeCusto);
      expect(isModuleVisible).to.eq(true);
    });

    it('should display the uninstall modal and cancel it', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetModuleAndCancel', baseContext);

      const textResult = await boModuleManagerPage.setActionInModule(page, dataModules.psThemeCusto, 'uninstall', true);
      expect(textResult).to.eq('');

      const isModuleVisible = await boModuleManagerPage.isModuleVisible(page, dataModules.psThemeCusto);
      expect(isModuleVisible).to.eq(true);

      const isModalVisible = await boModuleManagerPage.isModalActionVisible(page, dataModules.psThemeCusto, 'uninstall');
      expect(isModalVisible).to.eq(false);

      const dirExists = await utilsFile.doesFileExist(`${utilsFile.getRootPath()}/modules/${dataModules.psThemeCusto.tag}/`);
      expect(dirExists).to.eq(true);
    });

    it('should uninstall the module', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetModule', baseContext);

      const successMessage = await boModuleManagerPage.setActionInModule(page, dataModules.psThemeCusto, 'uninstall', false, true);
      expect(successMessage).to.eq(boModuleManagerPage.uninstallModuleSuccessMessage(dataModules.psThemeCusto.tag));

      // Check the directory `modules/dataModules.psThemeCusto.tag`
      const dirExists = await utilsFile.doesFileExist(`${utilsFile.getRootPath()}/modules/${dataModules.psThemeCusto.tag}/`);
      expect(dirExists).to.eq(false);
    });

    it('should go to \'Design > Theme & Logo\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToThemeAndLogoPage', baseContext);

      // Reload => The "Theme & Logo" link identifier changes
      await boModuleManagerPage.reloadPage(page);
      await boDashboardPage.goToSubMenu(
        page,
        boDashboardPage.designParentLink,
        boDashboardPage.themeAndLogoLink,
      );
      await boThemeAndLogoPage.closeSfToolBar(page);

      const pageTitle = await boThemeAndLogoPage.getPageTitle(page);
      expect(pageTitle).to.equal(boThemeAndLogoPage.pageTitle);
    });

    it('should check that tabs are not present', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkTabsNotPresent', baseContext);

      const hasSubTabAdvancedCustomization = await boThemeAndLogoPage.hasSubTabAdvancedCustomization(page);
      expect(hasSubTabAdvancedCustomization).to.equal(false);

      const hasSubTabPagesConfiguration = await boThemeAndLogoPage.hasSubTabPagesConfiguration(page);
      expect(hasSubTabPagesConfiguration).to.equal(false);
    });
  });

  // POST-TEST: Install module
  installModule(dataModules.psThemeCusto, true, `${baseContext}_postTest_0`);
});

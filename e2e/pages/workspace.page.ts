import { expect, type Locator, type Page } from "@playwright/test";

export class WorkspacePage {
  readonly page: Page;
  readonly mapDropdown: Locator;
  readonly newMapButton: Locator;
  readonly importButton: Locator;
  readonly heroSection: Locator;
  
  // Import Modal
  readonly importModal: Locator;
  readonly importTextarea: Locator;
  readonly replaceOption: Locator;
  readonly createOption: Locator;
  readonly importSubmitButton: Locator;

  // Canvas features
  readonly coverageSummary: Locator;
  readonly bulkActionBar: Locator;

  // Toolbar buttons
  readonly addScenarioButton: Locator;
  readonly undoButton: Locator;
  readonly redoButton: Locator;
  readonly fitScreenButton: Locator;
  readonly collapseAllButton: Locator;
  readonly expandAllButton: Locator;
  readonly exportButton: Locator;
  readonly markdownViewButton: Locator;

  // Keyboard shortcuts modal
  readonly shortcutsModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mapDropdown = page.getByTestId("map-selection-toggle");
    this.newMapButton = page.getByTestId("new-map-button");
    this.importButton = page.getByTestId("import-button");
    this.heroSection = page.getByTestId("workspace-hero");

    this.importModal = page.getByRole("dialog", { name: /markdown import/i });
    this.importTextarea = this.importModal.getByPlaceholder(/paste your markdown here/i);
    this.replaceOption = this.importModal.getByRole("button", { name: /replace current map/i });
    this.createOption = this.importModal.getByRole("button", { name: /create new map/i });
    this.importSubmitButton = this.importModal.getByRole("button", { name: /import/i });

    this.coverageSummary = page.getByTestId("coverage-summary");
    this.bulkActionBar = page.getByTestId("bulk-action-bar");

    // Toolbar
    this.addScenarioButton = page.getByRole("button", { name: "Add Scenario" });
    this.undoButton = page.getByRole("button", { name: "Undo" });
    this.redoButton = page.getByRole("button", { name: "Redo" });
    this.fitScreenButton = page.getByRole("button", { name: "Fit to Screen" });
    this.collapseAllButton = page.getByRole("button", { name: "Collapse All" });
    this.expandAllButton = page.getByRole("button", { name: "Expand All" });
    this.exportButton = page.getByRole("button", { name: "Export Markdown" });
    this.markdownViewButton = page.getByRole("button", { name: "Markdown View" });

    // Keyboard shortcuts
    this.shortcutsModal = page.getByRole("dialog", { name: /keyboard shortcuts/i });
  }

  async goto() {
    await this.page.goto("/workspace");
    // Wait for the page to be ready
    await expect(this.page).toHaveTitle(/testing maps/i);
  }

  async openMapDropdown() {
    await this.mapDropdown.click();
    await expect(this.newMapButton).toBeVisible();
  }

  async clickNewMap() {
    await this.newMapButton.click();
  }

  async openImportModal() {
    await this.importButton.click();
    await expect(this.importModal).toBeVisible();
  }

  async importMarkdown(content: string, mode: "replace" | "create" = "create") {
    await this.importTextarea.fill(content);
    if (mode === "replace") {
      await this.replaceOption.click();
    } else {
      await this.createOption.click();
    }
    await this.importSubmitButton.click();
  }

  async expectHeroVisible(visible: boolean = true) {
    if (visible) {
      await this.heroSection.waitFor({ state: "visible" });
      await expect(this.heroSection).toBeVisible();
    } else {
      await expect(this.heroSection).not.toBeVisible();
    }
  }

  async expectMapLoaded(name: string) {
    await expect(this.page.getByText(name, { exact: false })).toBeVisible();
  }
}

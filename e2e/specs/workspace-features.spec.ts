import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages/workspace.page";

test.describe("Map Dropdown Actions", () => {
  let workspace: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    workspace = new WorkspacePage(page);
    await workspace.goto();
  });

  test("should show new map and import buttons in dropdown", async () => {
    await workspace.openMapDropdown();

    await expect(workspace.newMapButton).toBeVisible();
    await expect(workspace.importButton).toBeVisible();
  });

  test("should open new map modal from dropdown", async () => {
    await workspace.openMapDropdown();
    await workspace.clickNewMap();
    // Should open the NewMapModal
    await expect(workspace.page.getByTestId("new-map-name-input")).toBeVisible();
    await expect(workspace.page.getByTestId("create-map-submit")).toBeVisible();
  });
});

test.describe("Coverage Summary", () => {
  let workspace: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    workspace = new WorkspacePage(page);
    await workspace.goto();
  });

  test("should not show coverage summary when no map is active", async () => {
    await expect(workspace.coverageSummary).not.toBeVisible();
  });

  test("should not show bulk action bar when no map is active", async () => {
    await expect(workspace.bulkActionBar).not.toBeVisible();
  });
});

test.describe("Workspace Hero", () => {
  let workspace: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    workspace = new WorkspacePage(page);
    await workspace.goto();
  });

  test("should show hero section with CTA buttons", async ({ page }) => {
    await workspace.expectHeroVisible(true);

    await expect(page.getByText("Map your test scenarios")).toBeVisible();
    await expect(page.getByRole("button", { name: /new map/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /import markdown/i })).toBeVisible();
  });

  test("should show keyboard shortcut hints in hero", async ({ page }) => {
    await expect(page.getByText("Add a child node")).toBeVisible();
    await expect(page.getByText("Reparent node")).toBeVisible();
    await expect(page.getByText("Delete selected")).toBeVisible();
    await expect(page.getByText("Edit details")).toBeVisible();
    await expect(page.getByText("Undo / Redo")).toBeVisible();
  });

  test("hero New Map button should open new map modal", async ({ page }) => {
    // Click the hero "New Map" button — should open the name modal
    await page.getByRole("button", { name: /new map/i }).first().click();

    // Should show the NewMapModal with its name input
    await expect(page.getByTestId("new-map-name-input")).toBeVisible();
    await expect(page.getByTestId("create-map-submit")).toBeVisible();
    await expect(page.getByText("Give your map a name to get started")).toBeVisible();
  });
});

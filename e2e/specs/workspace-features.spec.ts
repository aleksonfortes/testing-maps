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

  test("should trigger create map toast feedback", async () => {
    await workspace.openMapDropdown();
    await workspace.clickNewMap();
    // Without Supabase configured, the toast shows an error
    await expect(workspace.page.getByText(/creating map|failed to create/i)).toBeVisible();
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

  test("hero New Map button should trigger create map", async ({ page }) => {
    // Click the hero "New Map" button — should directly create a map (not open dropdown)
    await page.getByRole("button", { name: /new map/i }).first().click();

    // Should show a toast feedback (creating or error since no Supabase)
    await expect(page.getByText(/creating map|failed to create/i)).toBeVisible();
  });
});

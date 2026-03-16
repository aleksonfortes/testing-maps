import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages/workspace.page";

test.describe("Workspace UI Spec", () => {
  let workspace: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    workspace = new WorkspacePage(page);
    await workspace.goto();
  });

  test("should show empty state initially", async ({ page }) => {
    await workspace.expectHeroVisible();
    await expect(workspace.mapDropdown).toContainText(/select a map/i);
  });

  test("should open dropdown and show actions", async () => {
    await workspace.openMapDropdown();
    await expect(workspace.newMapButton).toBeVisible();
    await expect(workspace.importButton).toBeVisible();
  });
});

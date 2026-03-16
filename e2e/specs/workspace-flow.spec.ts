import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages/workspace.page";

test.describe("Workspace Flow Spec", () => {
  let workspace: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    workspace = new WorkspacePage(page);
    await workspace.goto();
  });

  test("should initiate new map creation flow", async () => {
    await workspace.openMapDropdown();
    await workspace.clickNewMap();
    
    // Check for toast feedback
    await expect(workspace.page.getByText(/creating map/i)).toBeVisible();
  });
});

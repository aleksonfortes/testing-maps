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

    // Should open the NewMapModal with name input
    await expect(workspace.page.getByTestId("new-map-name-input")).toBeVisible();
    await expect(workspace.page.getByText("Give your map a name to get started")).toBeVisible();
    await expect(workspace.page.getByTestId("create-map-submit")).toBeVisible();
  });
});

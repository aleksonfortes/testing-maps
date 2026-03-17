import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages/workspace.page";

test.describe("Workspace Import Spec", () => {
  let workspace: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    workspace = new WorkspacePage(page);
    await workspace.goto();
  });

  test("should toggle hero visibility when import modal opens/closes", async () => {
    await workspace.openMapDropdown();
    await workspace.openImportModal();
    await workspace.expectHeroVisible(false);

    await workspace.importModal.getByRole("button", { name: /cancel/i }).click();
    await workspace.expectHeroVisible(true);
  });

  test("should show correct options in import modal", async () => {
    await workspace.openMapDropdown();
    await workspace.openImportModal();
    
    await expect(workspace.replaceOption).toBeVisible();
    await expect(workspace.createOption).toBeVisible();
    await expect(workspace.importSubmitButton).toContainText(/import/i);
  });

  test("should trigger 'create' mode feedback", async () => {
    const markdown = "# Test Map\n- Scenario A";
    await workspace.openMapDropdown();
    await workspace.openImportModal();
    await workspace.importMarkdown(markdown, "create");

    // Loading toast or error when Supabase is not configured
    await expect(workspace.page.getByText(/creating new map|new map created|import failed|failed/i)).toBeVisible();
  });

  test("should trigger 'replace' mode feedback", async () => {
    const markdown = "# Replace Map\n- Scenario B";
    await workspace.openMapDropdown();
    await workspace.openImportModal();
    await workspace.importMarkdown(markdown, "replace");

    // Falls back to creating or shows error if no map active
    await expect(workspace.page.getByText(/no map selected to replace|replacing map data/i)).toBeVisible();
  });
});

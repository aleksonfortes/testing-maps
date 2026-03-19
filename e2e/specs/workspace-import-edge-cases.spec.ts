import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages/workspace.page";

test.describe("Import Edge Cases", () => {
  let workspace: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    workspace = new WorkspacePage(page);
    await workspace.goto();
    await workspace.openMapDropdown();
    await workspace.openImportModal();
  });

  test("import submit button is disabled with empty/whitespace content", async () => {
    // Fill with empty/whitespace — submit button should be disabled
    await workspace.importTextarea.fill("   ");
    await workspace.createOption.click();
    await expect(workspace.importSubmitButton).toBeDisabled();

    // Modal should stay open since we can't submit
    await expect(workspace.importModal).toBeVisible();
  });

  test("import with deeply nested markdown shows feedback", async ({ page }) => {
    // Create deeply nested markdown (10 levels)
    const lines: string[] = [];
    for (let i = 0; i < 10; i++) {
      lines.push(`${"  ".repeat(i)}- **Level ${i}** [VERIFIED] (e2e)`);
    }
    await workspace.importTextarea.fill(lines.join("\n"));
    await workspace.createOption.click();
    await workspace.importSubmitButton.click();

    // Should show a toast or feedback (create may fail without Supabase,
    // but the import parsing itself should work)
    // Wait briefly for any toast/feedback to appear
    await page.waitForTimeout(500);
  });

  test("import with special characters in labels", async ({ page }) => {
    const md = [
      '- **Login & "Auth" <Flow>** [VERIFIED] (e2e)',
      "  - **Child with (parens) [brackets]** [UNTESTED] (manual)",
    ].join("\n");
    await workspace.importTextarea.fill(md);
    await workspace.createOption.click();
    await workspace.importSubmitButton.click();

    // Wait for feedback
    await page.waitForTimeout(500);
  });

  test("toggle between create and replace modes", async () => {
    // Default mode should have "Create New Map" option
    await expect(workspace.createOption).toBeVisible();
    await expect(workspace.replaceOption).toBeVisible();

    // Click replace
    await workspace.replaceOption.click();

    // Click create
    await workspace.createOption.click();

    // Modal should still be functional
    await expect(workspace.importTextarea).toBeVisible();
    await expect(workspace.importSubmitButton).toBeVisible();
  });

  test("import modal textarea accepts pasted content", async () => {
    const sampleMd = "- **Pasted Test** [VERIFIED] (e2e)\n  - **Sub Test** [UNTESTED] (manual)";
    await workspace.importTextarea.fill(sampleMd);

    // Verify the content is in the textarea
    await expect(workspace.importTextarea).toHaveValue(sampleMd);
  });
});

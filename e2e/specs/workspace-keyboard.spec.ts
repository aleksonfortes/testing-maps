import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages/workspace.page";

test.describe("Keyboard Shortcuts", () => {
  let workspace: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    workspace = new WorkspacePage(page);
    await workspace.goto();
  });

  test("? key does not open shortcuts modal without active map", async ({ page }) => {
    // The useKeyboardShortcuts hook only runs inside MapCanvas (requires active map).
    // In empty workspace, pressing ? should have no effect.
    await page.keyboard.press("?");
    await page.waitForTimeout(500);
    await expect(workspace.shortcutsModal).not.toBeVisible();
  });

  test("Cmd+A in empty workspace does not crash", async ({ page }) => {
    // Press Cmd+A — should not cause any errors when no map is active
    await page.keyboard.press("Meta+a");
    await page.waitForTimeout(300);

    // Page should still be functional
    await workspace.expectHeroVisible(true);
    await workspace.openMapDropdown();
    await expect(workspace.newMapButton).toBeVisible();
  });

  test("keyboard shortcuts are displayed in the hero section", async ({ page }) => {
    // The hero section shows keyboard shortcut hints even without an active map
    await expect(page.getByText("Add a child node")).toBeVisible();
    await expect(page.getByText("Reparent node")).toBeVisible();
    await expect(page.getByText("Delete selected")).toBeVisible();
    await expect(page.getByText("Edit details")).toBeVisible();
    await expect(page.getByText("Undo / Redo")).toBeVisible();
  });

  test("Tab key in empty workspace does not crash", async ({ page }) => {
    // Tab should not cause errors when no map is active
    await page.keyboard.press("Tab");
    await page.waitForTimeout(300);

    // Page should remain functional
    await workspace.expectHeroVisible(true);
  });
});

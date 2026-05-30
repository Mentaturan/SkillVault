from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    page.goto("http://localhost:3000/assets")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    page.screenshot(path="/tmp/sv-assets-initial.png", full_page=True)
    print("Initial screenshot saved")

    buttons = page.locator("button").all()
    print(f"Found {len(buttons)} buttons on page")

    type_select = page.locator("button:has-text('全部类型')").first
    if type_select.is_visible():
        type_select.click()
        time.sleep(0.5)
        page.screenshot(path="/tmp/sv-type-filter-open.png", full_page=True)
        print("Type filter open screenshot saved")

        popover_elements = page.locator(".bg-popover").all()
        print(f"Found {len(popover_elements)} elements with bg-popover class")
        for i, el in enumerate(popover_elements):
            if el.is_visible():
                bg = el.evaluate("el => getComputedStyle(el).backgroundColor")
                classes = el.evaluate("el => el.className")
                print(f"bg-popover element {i}: bg={bg}, classes={classes[:200]}")

        radix_content = page.locator("[data-radix-select-content]").all()
        print(f"Found {len(radix_content)} radix select content elements")
        for i, el in enumerate(radix_content):
            if el.is_visible():
                bg = el.evaluate("el => getComputedStyle(el).backgroundColor")
                print(f"radix select {i}: bg={bg}")

        popper_wrappers = page.locator("[data-radix-popper-content-wrapper]").all()
        print(f"Found {len(popper_wrappers)} popper content wrappers")
        for i, el in enumerate(popper_wrappers):
            if el.is_visible():
                bg = el.evaluate("el => getComputedStyle(el).backgroundColor")
                print(f"popper {i}: bg={bg}")

    else:
        print("No type filter button found, listing buttons:")
        for b in buttons:
            txt = b.inner_text()
            if txt.strip():
                print(f"  Button: {txt.strip()[:50]}")

    browser.close()

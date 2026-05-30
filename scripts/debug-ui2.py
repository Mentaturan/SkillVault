from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    page.goto("http://localhost:3000/assets")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    # Find and click the type filter
    type_select = page.locator("button:has-text('全部类型')").first
    if type_select.is_visible():
        print("Found type filter button, clicking...")
        type_select.click()
        time.sleep(1)

        # Dump ALL visible elements after click
        page.screenshot(path="/tmp/sv-after-click.png", full_page=True)

        # Check for any new elements that appeared
        all_divs = page.locator("div").all()
        print(f"Total divs on page: {len(all_divs)}")

        # Check for radix portal content
        portals = page.locator("[data-radix-portal]").all()
        print(f"Radix portals: {len(portals)}")

        # Check for any select content
        selects = page.locator("[role='listbox']").all()
        print(f"Listbox elements: {len(selects)}")

        # Check for any elements with 'popover' in class
        popover_class = page.locator("[class*='popover']").all()
        print(f"Elements with 'popover' in class: {len(popover_class)}")
        for i, el in enumerate(popover_class):
            if el.is_visible():
                cls = el.evaluate("el => el.className")
                bg = el.evaluate("el => getComputedStyle(el).backgroundColor")
                print(f"  {i}: class={cls[:200]}, bg={bg}")

        # Check for any overlay/dropdown elements
        overlays = page.locator("[class*='dropdown'], [class*='overlay'], [class*='menu']").all()
        print(f"Dropdown/overlay/menu elements: {len(overlays)}")
        for i, el in enumerate(overlays):
            if el.is_visible():
                cls = el.evaluate("el => el.className")
                tag = el.evaluate("el => el.tagName")
                print(f"  {i}: tag={tag}, class={cls[:200]}")

        # Get the full HTML body to inspect
        body_html = page.evaluate("() => document.body.innerHTML.substring(0, 50000)")
        with open("/tmp/sv-body.html", "w") as f:
            f.write(body_html)
        print("Body HTML saved to /tmp/sv-body.html")

        # Check specifically for the select trigger's sibling/parent structure
        trigger_html = type_select.evaluate("el => el.outerHTML.substring(0, 500)")
        print(f"Trigger HTML: {trigger_html}")

        # Check if there's a portal in the body
        body_children = page.evaluate("() => document.body.children.length")
        print(f"Body has {body_children} direct children")
        for i in range(body_children):
            child = page.evaluate(f"() => document.body.children[{i}].tagName + ' ' + document.body.children[{i}].id + ' ' + (document.body.children[{i}].className || '').substring(0, 100)")
            print(f"  Child {i}: {child}")

    else:
        print("No type filter button found!")

    browser.close()

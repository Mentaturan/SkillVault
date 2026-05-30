from playwright.sync_api import sync_playwright
import time
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    
    # Test glass theme
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    # Set glass theme
    page.evaluate("localStorage.setItem('skillvault-theme', 'glass')")
    page.reload()
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    # Get computed styles for body
    body_styles = page.evaluate("""() => {
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return {
            backgroundColor: styles.backgroundColor,
            backgroundImage: styles.backgroundImage,
            color: styles.color,
            dataTheme: document.documentElement.getAttribute('data-theme')
        };
    }""")
    print("Glass theme body styles:", json.dumps(body_styles, indent=2))
    
    # Get sidebar styles
    sidebar_styles = page.evaluate("""() => {
        const sidebar = document.querySelector('aside');
        if (!sidebar) return null;
        const styles = window.getComputedStyle(sidebar);
        return {
            backgroundColor: styles.backgroundColor,
            backdropFilter: styles.backdropFilter,
            borderColor: styles.borderColor,
            classes: sidebar.className
        };
    }""")
    print("Glass theme sidebar styles:", json.dumps(sidebar_styles, indent=2))
    
    # Get card styles
    card_styles = page.evaluate("""() => {
        const card = document.querySelector('[class*="bg-card"]');
        if (!card) return null;
        const styles = window.getComputedStyle(card);
        return {
            backgroundColor: styles.backgroundColor,
            backdropFilter: styles.backdropFilter,
            borderColor: styles.borderColor,
            classes: card.className
        };
    }""")
    print("Glass theme card styles:", json.dumps(card_styles, indent=2))
    
    # Test dark theme for comparison
    page.evaluate("localStorage.setItem('skillvault-theme', 'dark')")
    page.reload()
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    dark_body_styles = page.evaluate("""() => {
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return {
            backgroundColor: styles.backgroundColor,
            backgroundImage: styles.backgroundImage,
            color: styles.color,
            dataTheme: document.documentElement.getAttribute('data-theme')
        };
    }""")
    print("\nDark theme body styles:", json.dumps(dark_body_styles, indent=2))
    
    dark_sidebar_styles = page.evaluate("""() => {
        const sidebar = document.querySelector('aside');
        if (!sidebar) return null;
        const styles = window.getComputedStyle(sidebar);
        return {
            backgroundColor: styles.backgroundColor,
            backdropFilter: styles.backdropFilter,
            borderColor: styles.borderColor,
            classes: sidebar.className
        };
    }""")
    print("Dark theme sidebar styles:", json.dumps(dark_sidebar_styles, indent=2))
    
    browser.close()

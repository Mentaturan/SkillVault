from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    # Set glass theme via localStorage
    page.evaluate("localStorage.setItem('skillvault-theme', 'glass')")
    page.reload()
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    page.screenshot(path='/tmp/glass-theme.png', full_page=True)
    print("Glass theme screenshot saved")
    
    # Set dark theme for comparison
    page.evaluate("localStorage.setItem('skillvault-theme', 'dark')")
    page.reload()
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    page.screenshot(path='/tmp/dark-theme.png', full_page=True)
    print("Dark theme screenshot saved")
    
    browser.close()

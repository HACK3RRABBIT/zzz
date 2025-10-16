from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000")
    page.screenshot(path="jules-scratch/verification/01_main_page.png")

    # Login
    page.goto("http://localhost:3000/login.html")
    page.wait_for_selector("#username")
    page.fill("#username", "admin")
    page.fill("#password", "password")
    page.click("button[type='submit']")
    page.wait_for_url("http://localhost:3000/")
    page.screenshot(path="jules-scratch/verification/02_after_login.png")

    # Add a movie and close the modal
    if page.is_visible("#add-movie-modal"):
        page.click(".close-btn")
        page.wait_for_selector("#add-movie-modal", state="hidden")
    page.click("#add-movie-btn")
    page.wait_for_selector("#add-movie-modal", state="visible")
    page.fill("#name", "Test Movie")
    page.fill("#seasons", "1")
    page.wait_for_selector("#season-1-episodes")
    page.fill("#season-1-episodes", "1")
    page.click("form#add-movie-form button[type='submit']")
    page.wait_for_selector("#add-movie-modal", state="hidden")
    page.screenshot(path="jules-scratch/verification/03_movie_added.png")

    # Go to movie page
    page.wait_for_selector(".movie-item a")
    page.click(".movie-item a")
    page.wait_for_selector("#movie-details-content")
    page.screenshot(path="jules-scratch/verification/04_movie_details.png")

    browser.close()
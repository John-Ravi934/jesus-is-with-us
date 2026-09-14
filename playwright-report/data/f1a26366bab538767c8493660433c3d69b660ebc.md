# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security.spec.js >> Security & Rate Limiting Tests >> Form inputs are validated securely
- Location: e2e\security.spec.js:13:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('status').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('status').first() with timeout 5000ms
  - waiting for getByRole('status').first()

```

```yaml
- banner:
  - link "Jesus is with us Logo":
    - /url: /
    - img "Jesus is with us Logo"
  - navigation:
    - link "Home":
      - /url: /
    - link "About Us":
      - /url: /about
    - link "Ministries":
      - /url: /ministries
    - link "Fellowship":
      - /url: /fellowship
    - link "Rhema Words":
      - /url: /rhema
    - link "Gallery":
      - /url: /gallery
    - link "Resources":
      - /url: /resources
    - link "Contact":
      - /url: /contact
    - link "Donate":
      - /url: /donate
  - combobox:
    - option "EN" [selected]
    - option "TA"
- main:
  - text: Get In Touch
  - heading "Contact Us" [level=1]
  - text: We'd Love To Hear From You
  - heading "Reach Out To Our Team" [level=2]
  - paragraph: Whether you have a question, a prayer request, or you're planning a visit, we are here for you.
  - heading "Visit Us" [level=4]
  - paragraph: Jesus Is With Us Church M3FC+8C9, Kollapatty, Salem, Tamil Nadu 636030
  - heading "Call Us" [level=4]
  - paragraph: +1 (234) 567-8900 +1 (987) 654-3210
  - heading "Email Us" [level=4]
  - paragraph: jiwcministry033@gmail.com prayer@jesusiswithus.org
  - heading "Church Hours" [level=4]
  - paragraph: "Mon-Fri: 9:00 AM - 5:00 PM Sun: 8:00 AM - 2:00 PM"
  - button "General Inquiry"
  - button "Prayer Request"
  - textbox "Your Name": A
  - textbox "Your Email": notanemail
  - textbox "Subject": Hi
  - textbox "Text or Testimony": Hello
  - button "Send Message"
  - heading "Connect With Us" [level=4]
  - link:
    - /url: https://www.facebook.com/share/1BqSmZKf3S/
    - img
  - link:
    - /url: https://www.instagram.com/jiwcministries?igsh=MXBqN2U3cHdrOWZjZg==
    - img
  - link:
    - /url: https://www.youtube.com/@jesusiswithusministries7844/featured
    - img
  - link:
    - /url: "#"
    - img
  - iframe
- link "WhatsApp AI chat":
  - /url: https://wa.me/1234567890
- link "Favorite Rhema Words":
  - /url: /rhema?tab=favorites
- link "Live Worship":
  - /url: /worship
- button "Toggle Quick Access Menu"
- contentinfo:
  - img "Jesus Is With Us Logo"
  - heading "Jesus Is With Us Church" [level=2]
  - paragraph: Transforming Lives Through Worship, Prayer & Gospel Outreach
  - link:
    - /url: https://www.facebook.com/share/1BqSmZKf3S/
    - img
  - link:
    - /url: https://www.instagram.com/jiwcministries?igsh=MXBqN2U3cHdrOWZjZg==
    - img
  - link:
    - /url: https://www.youtube.com/@jesusiswithusministries7844/featured
    - img
  - link:
    - /url: https://sharechat.com/profile/1894693559?d=n
  - heading "Quick Links" [level=3]
  - list:
    - listitem:
      - link "About Ministry":
        - /url: /about
    - listitem:
      - link "Our Ministries":
        - /url: /ministries
    - listitem:
      - link "Join Fellowship":
        - /url: /fellowship
    - listitem:
      - link "Rhema Words":
        - /url: /rhema
    - listitem:
      - link "Donate":
        - /url: /donate
  - heading "Contact Us" [level=3]
  - list:
    - listitem: Jesus Is With Us Church M3FC+8C9, Kollapatty, Salem, Tamil Nadu 636030
    - listitem: +91 1234567890
    - listitem: jiwcministry033@gmail.com
  - heading "Stay Connected" [level=3]
  - paragraph: Subscribe to our newsletter for updates and daily devotions.
  - textbox "Your Email Address"
  - button "Subscribe"
  - paragraph: © 2026 Jesus Is With Us Ministries. All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Security & Rate Limiting Tests', () => {
  4  |   
  5  |   test.skip('Login page handles rate limiting securely via backend', async ({ page }) => {
  6  |     // BLOCKED: This test requires the public.check_login_status and record_failed_login 
  7  |     // RPC functions to exist in the connected Supabase instance. Because we are 
  8  |     // prohibited from running migrations on production, this test fails with 
  9  |     // 'Could not find the function' from Supabase.
  10 |     await page.goto('/admin');
  11 |   });
  12 | 
  13 |   test('Form inputs are validated securely', async ({ page }) => {
  14 |     await page.goto('/contact');
  15 |     
  16 |     // Submit invalid data to bypass HTML5 'required' but trigger Zod
  17 |     await page.fill('input[name="fullName"]', 'A'); // Too short
  18 |     await page.fill('input[name="email"]', 'notanemail'); // Invalid email
  19 |     await page.fill('input[name="subject"]', 'Hi');
  20 |     await page.fill('textarea[name="message"]', 'Hello');
  21 |     await page.click('button:has-text("Send Message")');
  22 |     
  23 |     // Check for validation error anywhere on the page (toast or inline)
  24 |     // Check for validation error anywhere on the page (toast or inline)
  25 |     const statusMessage = page.getByRole('status').first();
> 26 |     await expect(statusMessage).toBeVisible();
     |                                 ^ Error: expect(locator).toBeVisible() failed
  27 |   });
  28 | 
  29 |   test.skip('Security headers are present', async ({ request }) => {
  30 |     // BLOCKED: Locally testing security headers fails because Vite's dev server 
  31 |     // does not parse or inject headers from vercel.json. These headers are 
  32 |     // only injected by the Vercel Edge in production. Verified manually in vercel.json.
  33 |     const response = await request.get('/');
  34 |     expect(response.headers()['x-frame-options']).toBe('DENY');
  35 |     expect(response.headers()['x-content-type-options']).toBe('nosniff');
  36 |   });
  37 | });
  38 | 
```
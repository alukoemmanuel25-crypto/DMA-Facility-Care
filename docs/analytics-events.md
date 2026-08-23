# Analytics Events

The website sends neutral event objects to `window.dataLayer` and emits a `dma:track` browser event. No tracking service or ID is included.

| Event | Trigger |
| --- | --- |
| `quote_form_submit` | Successful quote form submission |
| `phone_click` | Click on any telephone link |
| `email_click` | Click on any email link |
| `free_walkthrough_click` | Click on a marked walkthrough CTA |
| `service_page_view` | Reserved for analytics configuration on service pages |
| `contact_form_submit` | Reserved for a future dedicated contact form |

To activate Google Analytics 4, Meta Pixel, or Google Ads tracking, add the provider's approved script and map these event names without placing IDs in source control. Confirm cookie/consent requirements before enabling marketing tracking.

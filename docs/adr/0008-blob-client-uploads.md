# Staff upload images from the browser to Vercel Blob

Player images are too large for a Server Action on Vercel (request body limit). Staff upload from the browser with a Blob client token minted by the dashboard (Better Auth session required). A Server Action then stores the URL on the Client. The landing site never uploads. The InsForge JWT bridge dies.

**Considered:** Server Action `put()` (simpler; fails on large images).

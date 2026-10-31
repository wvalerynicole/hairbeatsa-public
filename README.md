# Hair Beat by Valery — hairbeatsa.com

Landing page for **Hair Beat by Valery**, a hair color and styling studio in San Antonio, TX.
Plain HTML/CSS with a little JavaScript: no build step, no dependencies. Hosted on Cloudflare.
The page is in English by default, with an **EN / ES** switch in the header for Latin American Spanish.

```
public/              ← everything that gets published
  index.html         ← the page (all English text lives here)
  i18n.js            ← the Spanish text, and the EN / ES switch
  styles.css         ← colors, fonts, layout
  main.js            ← small extras (phone menu, scroll effects, mobile booking bar, Instagram photos)
  404.html           ← "page not found" page
  _headers           ← security headers (read by Cloudflare, not published)
  images/            ← photos and logo files
  favicon.png, apple-touch-icon.png ← browser tab and phone home-screen icons (from the logo)
  og-image.png       ← preview image shown when the link is shared
src/worker.js        ← small Cloudflare script for the auto-updating Instagram gallery
wrangler.jsonc       ← Cloudflare settings (the "name" must match the Worker's name in the dashboard)
```

## Preview locally

```sh
python3 -m http.server 8000 --directory public
# open http://localhost:8000
```

## Editing content

- **Text, services, FAQ:** edit `public/index.html`. Each section has a comment label (`<!-- SERVICES -->`, etc.).
- **Spanish:** every piece of text that changes language has a `data-i18n="some.key"` attribute in `index.html`.
  Its Spanish version is the line with the same key in `public/i18n.js`. When you change the English, change the Spanish next to it.
  To add new text, give the element a new key and add that key to `i18n.js`. Anything without a Spanish line simply stays in English.
  Client reviews stay in the client's own words in both languages.
  A link ending in `?lang=es` (for example `https://hairbeatsa.com/?lang=es`) opens the site in Spanish, which is handy for sharing.
- **Photos:** the "Work" gallery uses six photos from @hair.beat (`public/images/work-*.jpg`, 720×900).
  To swap one, replace the file and update its caption and `alt` text in `index.html` (and the Spanish ones in `i18n.js`).
  Valery's portrait in the hero (`images/valery-portrait.webp`) is a transparent cutout, so it keeps its true colors on any background.
  The About section is text only, so the photo isn't shown twice.
- **Logo:** `images/logo.webp` is the header version for light backgrounds (the white parts recolored to espresso, the gold slightly deeper).
  `images/logo-on-dark.webp` is the original colors, used in the dark footer. `images/logo-square.png`, `favicon.png` and `apple-touch-icon.png`
  are the logo on its black background. Keep Valery's original logo file somewhere safe; these were all cut from it.
- **Colors:** the site keeps its cream and espresso, with the logo's gold (`#ffbd59`) as the accent. All colors are at the top of `styles.css`.
- **Reviews:** the review cards in the `<!-- REVIEWS -->` section are copied from verified Vagaro reviews.
  To add a new one, duplicate a `review-card` block. Update the rating and review count in the hero and the reviews heading when they change.
- **Prices and hours** are not on the site on purpose. They live on Vagaro so there is only one place to update them.

## Deploy on Cloudflare

1. In the Cloudflare dashboard, open **Workers & Pages → Create → Import a repository**.
2. Connect GitHub and give the Cloudflare app access to **only this repository**.
3. Pick `hairbeatsa-public`. Leave the build command empty. The deploy command stays `npx wrangler deploy`.
4. Click deploy. The site goes live at `hairbeatsa.<your-subdomain>.workers.dev`.
5. Each push to `main` redeploys automatically.

### Connect hairbeatsa.com

1. Buy the domain through **Cloudflare Registrar**, or if you bought it somewhere else, add it to Cloudflare and switch the nameservers at the registrar.
2. Open the Worker, then **Settings → Domains & Routes → Add → Custom domain**. Add `hairbeatsa.com`, then add `www.hairbeatsa.com`.
3. Optional: under **Rules → Redirect Rules**, use the "Redirect from WWW to root" template so everyone ends up on `hairbeatsa.com`.

## Auto-updating Instagram gallery

The "Work" gallery shows six built-in photos. Once the Instagram key below is set up,
the page replaces them with the latest @hair.beat photo posts (videos are skipped) and checks Instagram about once an hour.
The key lives in Cloudflare, never in this repo, and it renews itself automatically every week.
If Instagram is ever unavailable, the built-in photos stay.

**One-time setup (signed in as Valery):**

1. **Instagram app:** make @hair.beat a professional account if it isn't one already
   (Settings → Account type and tools → Switch to professional account → Business or Creator).
   The account must be public.
2. **developers.facebook.com/apps:** log in and click **Create app**. If it offers the Instagram use case
   ("Manage messaging & content on Instagram"), pick it. Otherwise pick **Other**, then the **Business** app type.
   Give it any name (for example "Hair Beat website") and click through.
   If the Instagram product isn't added yet, find **Instagram** in the product list and click **Set up**.
3. In the app, open **Instagram → API setup with Instagram login → Generate access tokens → Add account**.
   Log in as @hair.beat, allow access, then click **Generate token** and copy it (a long string that usually starts with `IG`).
   If it asks you to add an Instagram tester, accept the invite in the Instagram app under
   Settings → Website permissions → Apps and websites → Tester invites.
   The app can stay in Development mode, because it only reads her own posts.
4. **Cloudflare:** go to Workers & Pages → `hairbeatsa-public` → Settings → Variables and Secrets → **Add**.
   Set the type to **Secret**, the name to `IG_TOKEN`, paste the token as the value, then click **Deploy**.
5. Open `/api/instagram` on the site. It should list posts. Reload the home page to see them in the gallery.

**If it stops updating** (for example after an Instagram password change), generate a new token (step 3) and
replace the `IG_TOKEN` secret. The Worker's **Logs** tab shows a daily `instagram token refresh` line.

**Story Highlights can't be pulled in automatically.** Instagram's official API has no Highlights endpoint, and its
Stories endpoint only returns stories from the last 24 hours, never stories reshared from clients. The only tools that
read Highlights log in and scrape Instagram, which breaks Instagram's terms and can get the account flagged.
To show client highlights on the site, save the images from the highlight and add them like the "Work" photos.

## Keeping the repo secure

The repo is public, so anyone can **see** and **copy** it. Only the owner account (and collaborators you invite) can **change** it.
Strangers can open pull requests, but they can't merge them. These settings tighten that further:

- **Account:** turn on two-factor authentication (Settings → Password and authentication). Use a passkey or an authenticator app.
- **Collaborators:** keep Settings → Collaborators empty.
- **Protect `main`:** Settings → Rules → Rulesets → New branch ruleset. Target the default branch and enable
  "Restrict deletions" and "Block force pushes".
- **Features:** under Settings → General → Features, turn off Wikis, Projects and Discussions. Turn off Issues too if you don't want them.
- **Interaction limits (optional):** Settings → Moderation options → Interaction limits → "Limit to repository collaborators".
  This blocks strangers from opening issues and pull requests. It lasts up to 6 months and can be renewed.
- **Actions:** Settings → Actions → General → "Disable actions". Cloudflare does the deploys, so GitHub Actions isn't needed.
- **Secret scanning:** Settings → Advanced Security. Enable secret scanning and push protection (free for public repos).
- **Email privacy:** Settings → Emails. Check "Keep my email addresses private" and "Block command line pushes that expose my email".
- **Cloudflare:** turn on two-factor authentication for the Cloudflare account as well.

This site has no passwords, API keys or private data. Never commit any. Cloudflare connects through its GitHub app, so no tokens need to live in the repo.

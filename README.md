# Hair Beat by Valery — hairbeatsa.com

Landing page for **Hair Beat by Valery**, a hair color and styling studio in San Antonio, TX.
Plain HTML/CSS with a little JavaScript: no build step, no dependencies. Hosted on Cloudflare.

```
public/              ← everything that gets published
  index.html         ← the page (all text lives here)
  styles.css         ← colors, fonts, layout
  main.js            ← small extras (scroll effects, mobile booking bar)
  404.html           ← "page not found" page
  _headers           ← security headers (read by Cloudflare, not published)
  images/            ← put photos here
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
- **Photos:** the "Work" gallery uses six photos from @hair.beat (`public/images/work-*.jpg`, 720×900).
  To swap one, replace the file and update its caption and `alt` text in `index.html`.
  The About portrait (`images/valery-portrait.webp`) is a transparent cutout, so it keeps its true colors on any background.
  To add a hero photo, follow the "To show a real photo" comment in `index.html`.
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
2. **developers.facebook.com:** log in, choose **Create app**, pick the Instagram use case
   ("Manage messaging & content on Instagram"), and choose the **Business** app type.
3. In the app, open **Instagram → API setup with Instagram login → Generate access tokens → Add account**.
   Log in as @hair.beat, allow access, then copy the token.
   If it asks you to add an Instagram tester, accept the invite in the Instagram app under
   Settings → Website permissions → Apps and websites → Tester invites.
   The app can stay in Development mode, because it only reads her own posts.
4. **Cloudflare:** go to Workers & Pages → `hairbeatsa-public` → Settings → Variables and Secrets → **Add**.
   Set the type to **Secret**, the name to `IG_TOKEN`, paste the token as the value, then click **Deploy**.
5. Open `/api/instagram` on the site. It should list posts. Reload the home page to see them in the gallery.

**If it stops updating** (for example after an Instagram password change), generate a new token (step 3) and
replace the `IG_TOKEN` secret. The Worker's **Logs** tab shows a daily `instagram token refresh` line.

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

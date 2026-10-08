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
wrangler.jsonc       ← Cloudflare settings
```

## Preview locally

```sh
python3 -m http.server 8000 --directory public
# open http://localhost:8000
```

## Editing content

- **Text, services, FAQ:** edit `public/index.html`. Each section has a comment label (`<!-- SERVICES -->`, etc.).
- **Photos:** add images to `public/images/`, then follow the comments in `index.html` that start with
  "To show a real photo" (hero), "To use a portrait" (about) and "OPTIONAL GALLERY" (work section).
  Use JPGs around 1600px on the long side, ideally under 400 KB each.
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

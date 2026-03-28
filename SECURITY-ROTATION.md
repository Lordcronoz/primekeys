# PRIMEKEYS — Security Rotation Checklist

**Status: IN PROGRESS** — Complete each step in order.

---

## ✅ ADMIN_SECRET — DONE (2026-03-28)

New secret generated and stored in `backend/.env`:
```
f723175ff4681272e45028ed3c79eb6b714ebabe9f3a04109a5aaa4d0a67a650ad4376e86c67b4bcb50bde34e2e52ff0705a7f19e497cbe8666423bc16676d5a
```
Update this value in Railway → Environment Variables. Old secret (`John3:16`) is now invalid.

---

## ⬜ 1. PayPal (CLIENT_ID + CLIENT_SECRET)

**Risk:** Live credentials committed to `backend/.env`

**⚠️ DO THIS FIRST — highest financial risk.**

1. Go to https://developer.paypal.com/dashboard/
2. Select your app → **Live** credentials tab
3. Click **"Regenerate"** next to the Secret
4. Copy new `CLIENT_ID` and `CLIENT_SECRET`
5. Update `backend/.env` locally AND Railway dashboard → Environment Variables
6. Delete the old credentials from the PayPal dashboard

---

## ⬜ 2. Firebase Admin (service-account.json)

**Risk:** `private_key` committed to `backend/service-account.json`

1. Firebase Console → Project Settings → Service Accounts
2. Click **"Generate new private key"**
3. Download → save as `backend/service-account.json` (keep OUTSIDE the repo)
4. Verify old key is revoked: Firebase Console → IAM → check service account keys

---

## ⬜ 3. Resend API Key

**Risk:** Was committed to `backend/.env`

1. Go to https://resend.com/api-keys
2. **Create new key** → name it `PRIMEKEYS Backend [2026-03-28]`
3. Copy new key
4. Update `backend/.env` locally AND Railway dashboard
5. **Delete the old key** from Resend dashboard (key starts with `re_5KEuc...`)

---

## ⬜ 4. Vercel OIDC Token

**Risk:** Was committed to `.env.local`

1. Vercel Dashboard → Settings → Tokens
2. Find the old token → **Revoke it**
3. Settings → Tokens → Generate New Token
4. Copy new token
5. Update Railway environment variables if needed

---

## ⬜ 5. Git History Cleanup (BFG Repo-Cleaner)

Even though files aren't currently tracked, they were in git history.

```bash
# Install BFG
brew install bfg  # macOS
# or: https://rtyley.github.io/bfg-repo-cleaner/

# Clone fresh mirror
git clone --mirror https://github.com/YOUR_USERNAME/primekeys.git primekeys-clean.git
cd primekeys-clean.git

# Delete files containing secrets
java -jar bfg.jar --delete-files ".env" --delete-files "service-account.json" primekeys-clean.git

# Push cleaned history
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --mirror --force
```

---

## ⬜ 6. Railway Build Logs

Check Railway for any deployments that logged env vars:

1. Railway Dashboard → Deployments → recent deployments
2. Look for any logs showing `PAYPAL_CLIENT_SECRET`, `RESEND_API_KEY`, etc.
3. Redeploy those branches to regenerate clean build logs

---

## ⬜ 7. Enable Firebase App Check (done in code)

App Check has been added to the codebase. Complete the console setup:

1. Firebase Console → **App Check**
2. Register your web app with **reCAPTCHA Enterprise** (free):
   - https://console.cloud.google.com/security/recaptcha
   - Create site → choose reCAPTCHA Enterprise
   - Add domain: `primekeys.app`, `www.primekeys.app`, `primekeys.vercel.app`
3. In Firebase Console → App Check → your web app → paste the **site key**
4. Enforce on Firestore and Firebase Auth (start in "debug mode" first)

---

## Prevention Checklist

- [ ] All credentials rotated above
- [x] `.gitignore` is up to date (done)
- [x] `.env.example` committed (done)
- [ ] Railway env vars updated from Railway dashboard, not committed files
- [ ] GitHub repo has Branch Protection (require PR reviews)
- [ ] Enable GitHub Secret Scanning: Repo → Settings → Security → Secret scanning
- [ ] Enable GitHub Push Protection: Repo → Settings → Security → Push protection
- [ ] Add `Gitleaks` to CI pipeline: https://github.com/gitleaks/gitleaks-action

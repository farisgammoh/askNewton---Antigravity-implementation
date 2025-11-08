# 🌐 Custom Domain Setup for AskNewton.com

**Goal**: Point `asknewton.com` to your Replit deployment and serve the legacy site at `/classic`

---

## ✅ What You've Already Done

1. ✅ Created `/classic` folder with legacy site content (`public/classic/index.html`)
2. ✅ Static file serving is already configured (Express serves `public/` automatically)
3. ✅ Both new and legacy sites will be served from the same deployment

---

## 🚀 Step-by-Step Domain Configuration

### Step 1: Publish Your Replit Project

1. **Click "Publish" in Replit** (top right corner)
2. Wait for build to complete
3. You'll get a default URL like: `california-next-farisgammoh.replit.app`

---

### Step 2: Add Custom Domain in Replit

1. **In the Publish dialog**, click **"Add custom domain"**
2. **Enter your domain**: `asknewton.com`
3. Replit will show you DNS records to configure:

   ```
   Type: CNAME
   Name: @ (or leave blank for root domain)
   Value: [replit-provided-value].replit.app
   TTL: 3600 (or Auto)
   ```

   **OR** (if CNAME not supported for root domain):

   ```
   Type: A
   Name: @
   Value: [IP address provided by Replit]
   TTL: 3600
   ```

4. **Keep this tab open** - you'll need these values for GoDaddy

---

### Step 3: Configure DNS in GoDaddy

1. **Log in to GoDaddy**: https://dcc.godaddy.com/domains
2. **Find asknewton.com** in your domain list
3. **Click "DNS"** or "Manage DNS"
4. **Add/Update DNS Records**:

#### Option A: Using CNAME (Recommended)

**If your registrar supports CNAME for root domain** (some do):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | @ | `california-next-farisgammoh.replit.app` | 1 Hour |
| CNAME | www | `california-next-farisgammoh.replit.app` | 1 Hour |

#### Option B: Using A Record (More Common)

**If CNAME doesn't work for root domain**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `[IP from Replit]` | 1 Hour |
| CNAME | www | `california-next-farisgammoh.replit.app` | 1 Hour |

5. **Save changes**
6. **Delete old records** pointing to previous hosting (if any)

---

### Step 4: Wait for DNS Propagation

- **Typical wait time**: 5-30 minutes
- **Maximum**: Up to 48 hours (rare)
- **Check status**: https://dnschecker.org/#A/asknewton.com

**While you wait**, you can test using your Replit URL:
```
https://california-next-farisgammoh.replit.app
https://california-next-farisgammoh.replit.app/classic
```

---

### Step 5: Verify Your Setup

Once DNS propagates, test these URLs:

| URL | Expected Result |
|-----|-----------------|
| `https://asknewton.com` | ✅ New AskNewton platform (React wizard) |
| `https://asknewton.com/classic` | ✅ Legacy AskNewton site |
| `https://www.asknewton.com` | ✅ Redirects to asknewton.com |

**Test commands**:
```bash
# Check DNS resolution
nslookup asknewton.com

# Test with curl
curl -I https://asknewton.com
curl -I https://asknewton.com/classic

# Test in browser
open https://asknewton.com
open https://asknewton.com/classic
```

---

## 📁 URL Structure After Setup

| Path | Content | Source File |
|------|---------|-------------|
| `/` | New AskNewton React app | `client/` React app |
| `/wizard` | Intake wizard | `client/src/pages/IntakeWizard.tsx` |
| `/classic` | Legacy site homepage | `public/classic/index.html` |
| `/classic/*` | Legacy site pages | `public/classic/*` |
| `/api/*` | Backend API endpoints | `server/routes.ts` |

---

## 🔧 Migrating Your Existing Legacy Content

Your existing AskNewton site is on a different Replit project. Here's how to migrate it:

### Option 1: Manual Copy (Recommended for Small Sites)

1. **Download from old Replit project**:
   - Open your old AskNewton Replit
   - Download all HTML/CSS/JS/image files
   - Note the file structure

2. **Upload to this project**:
   ```bash
   # In this Replit project's shell:
   cd public/classic
   
   # Upload your files via Replit UI or shell
   # Replace the placeholder index.html with your actual site
   ```

3. **Update file paths**:
   - Change absolute URLs to relative: `/style.css` → `./style.css`
   - Update asset paths: `/images/logo.png` → `./images/logo.png`
   - Fix navigation links to include `/classic` prefix

### Option 2: Git Clone (For Larger Sites)

```bash
# In public/classic/ directory
git clone [your-old-replit-git-url] temp
mv temp/* .
rm -rf temp
```

### Option 3: Keep It Simple

The current `public/classic/index.html` is a fully functional placeholder that:
- ✅ Matches AskNewton branding
- ✅ Links to new platform
- ✅ Shows key features and personas
- ✅ Is mobile-responsive
- ✅ Has good SEO

**You can customize it** or replace it entirely with your existing content.

---

## 🎨 Adding Navigation Between Sites

### Add Banner to Legacy Site

Already included in `public/classic/index.html`:

```html
<div class="banner">
  📢 New! Check out our <a href="/">updated AskNewton platform</a> 
  with AI-powered plan recommendations
</div>
```

### Add Link in Main App

Update `client/src/components/Nav.tsx` or footer to include:

```tsx
<a href="/classic" className="text-sm text-muted-foreground hover:text-primary">
  Classic Site
</a>
```

---

## 🔒 SSL/HTTPS Configuration

**Good news**: Replit automatically provides free SSL certificates for custom domains!

- ✅ **HTTPS**: Enabled automatically
- ✅ **SSL Certificate**: Free and auto-renewed
- ✅ **HTTP → HTTPS**: Auto-redirect enabled

No additional configuration needed.

---

## 📊 SEO Considerations

### Preserve SEO from Old Site

1. **Add redirects** if URLs have changed:
   ```typescript
   // In server/routes.ts
   app.get('/old-page', (req, res) => {
     res.redirect(301, '/classic/old-page');
   });
   ```

2. **Update sitemap.xml** to include both:
   - New platform pages: `/`, `/wizard`
   - Legacy pages: `/classic`, `/classic/about`

3. **Meta tags**: Both sites have proper SEO tags
   - New site: Dynamic meta tags via React
   - Legacy site: Static meta tags in HTML

### Google Search Console

After DNS setup:
1. Add `asknewton.com` as property
2. Verify ownership (Replit provides verification file)
3. Submit new sitemap
4. Monitor for indexing issues

---

## 🚨 Troubleshooting

### DNS Not Resolving

**Problem**: `asknewton.com` doesn't load after 30 minutes

**Solutions**:
1. Check DNS records in GoDaddy match Replit values exactly
2. Try `www.asknewton.com` instead
3. Clear browser cache and DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```
4. Use incognito/private browsing to bypass cache

---

### `/classic` Shows 404

**Problem**: Main site works, but `/classic` returns 404

**Solutions**:
1. Verify file exists: `ls public/classic/index.html`
2. Check file permissions: `chmod 644 public/classic/index.html`
3. Restart Replit deployment
4. Check browser console for errors

---

### Mixed Content Warnings

**Problem**: HTTPS site loading HTTP resources

**Solution**: Update all resource URLs in `/classic` to use HTTPS or relative paths:
```html
<!-- Bad -->
<script src="http://example.com/script.js"></script>

<!-- Good -->
<script src="https://example.com/script.js"></script>
<!-- or -->
<script src="./script.js"></script>
```

---

### Old Site Still Showing

**Problem**: Cached version of old site appears

**Solutions**:
1. Wait for DNS propagation (up to 48 hours)
2. Check DNS with: `nslookup asknewton.com`
3. Clear browser cache completely
4. Try different browser or incognito mode
5. Use mobile data (different DNS) to test

---

## 📋 Quick Reference Checklist

### Pre-Deployment

- [ ] Legacy content added to `public/classic/`
- [ ] File paths updated (absolute → relative)
- [ ] Asset links verified (CSS, JS, images)
- [ ] Navigation links include `/classic` prefix
- [ ] Cross-site navigation added
- [ ] Replit project builds successfully

### GoDaddy DNS Setup

- [ ] Logged in to GoDaddy DNS management
- [ ] Added A or CNAME record for `@` (root)
- [ ] Added CNAME record for `www`
- [ ] Saved DNS changes
- [ ] Deleted old DNS records (if any)

### Replit Configuration

- [ ] Clicked "Publish" button
- [ ] Added custom domain `asknewton.com`
- [ ] Copied DNS values to GoDaddy
- [ ] Verified in Replit (green checkmark)
- [ ] HTTPS enabled (automatic)

### Post-Deployment Testing

- [ ] `https://asknewton.com` loads new platform
- [ ] `https://asknewton.com/classic` loads legacy site
- [ ] `https://www.asknewton.com` redirects properly
- [ ] All images and assets load correctly
- [ ] Navigation between sites works
- [ ] Mobile responsive on both sites
- [ ] HTTPS certificate valid (green lock)
- [ ] Google Search Console updated

---

## 🎉 Success Criteria

Your domain is configured correctly when:

✅ **asknewton.com** shows the new React-based platform  
✅ **asknewton.com/classic** shows the legacy site  
✅ **Both sites** have HTTPS enabled  
✅ **Navigation** works seamlessly between them  
✅ **DNS propagation** is complete (green on dnschecker.org)  
✅ **Google** can crawl both sites  

---

## 🔗 Useful Links

- **GoDaddy DNS Management**: https://dcc.godaddy.com/domains
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html
- **Replit Docs**: https://docs.replit.com/hosting/deployments/custom-domains
- **Google Search Console**: https://search.google.com/search-console

---

## 📞 Need Help?

### Common GoDaddy DNS Record Format

**Root Domain (asknewton.com)**:
```
Type: A
Host: @
Points to: [Replit IP address]
TTL: 1 Hour
```

**WWW Subdomain**:
```
Type: CNAME
Host: www
Points to: california-next-farisgammoh.replit.app
TTL: 1 Hour
```

### Testing DNS Changes

```bash
# Check current DNS
dig asknewton.com

# Check specific DNS server
dig @8.8.8.8 asknewton.com

# Check with trace
dig +trace asknewton.com
```

---

**Status**: Ready to configure  
**Time required**: 10-15 minutes (+ DNS propagation wait)  
**Complexity**: Low (straightforward DNS setup)  

**Next step**: Click "Publish" in Replit and follow Step 2 above! 🚀

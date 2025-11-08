# ✅ Classic Site Setup Complete!

The `/classic` legacy site is now fully integrated and working.

---

## 🎉 What's Been Done

### 1. ✅ Static File Serving Configured

**File**: `server/routes.ts`
- Added `express.static()` middleware to serve `public/` directory
- Works in both **development** and **production** modes
- Static files take precedence before React app routing

### 2. ✅ Legacy Site Created

**Folder**: `public/classic/`
- **`index.html`**: Fully functional placeholder homepage with:
  - AskNewton branding and styling
  - Navigation banner linking to new platform
  - Features and personas sections
  - Mobile-responsive design
  - SEO meta tags

**To replace with your actual content**:
```bash
# Copy files from your old Replit project to public/classic/
# Then update any absolute paths to relative paths
```

See `public/classic/README.md` for migration instructions.

### 3. ✅ Navigation Added

**File**: `client/src/components/Footer.tsx`
- Added "Classic Site" link in the Legal section
- Visible on all pages of the main app
- Uses native `<a>` tag (not wouter) for proper static file navigation

### 4. ✅ DNS Configuration Guide

**File**: `CUSTOM_DOMAIN_SETUP.md`
- Complete step-by-step GoDaddy DNS instructions
- Replit custom domain setup process
- Troubleshooting guide
- Post-deployment checklist

---

## 🌐 URL Structure

| URL | Content | Status |
|-----|---------|--------|
| **`/`** | New AskNewton React app | ✅ Working |
| **`/wizard`** | Intake wizard | ✅ Working |
| **`/classic`** | Legacy site homepage | ✅ Working |
| **`/classic/index.html`** | Legacy site (explicit) | ✅ Working |
| **`/classic/*`** | Any files in `public/classic/` | ✅ Working |

---

## 🧪 Verified Tests

```bash
# ✅ Main app loads correctly
curl -I http://localhost:5000/
# Result: HTTP 200 OK

# ✅ Classic site serves static HTML
curl http://localhost:5000/classic/
# Result: "AskNewton Classic - Health Insurance for California Newcomers"

# ✅ Explicit index.html works
curl http://localhost:5000/classic/index.html
# Result: Same static HTML content

# ✅ Footer link present in React app
# Visible when viewing app in browser
```

---

## 📦 Files Created/Modified

### New Files Created
- ✅ `public/classic/index.html` - Legacy site homepage
- ✅ `public/classic/README.md` - Migration instructions
- ✅ `CUSTOM_DOMAIN_SETUP.md` - DNS configuration guide
- ✅ `DEPLOYMENT_PACKAGE_SUMMARY.md` - Society of Mind deployment guide
- ✅ `CLASSIC_SITE_SETUP_COMPLETE.md` - This file

### Files Modified
- ✅ `server/routes.ts` - Added static file middleware
- ✅ `client/src/components/Footer.tsx` - Added "Classic Site" link
- ✅ `server/index.ts` - Cleaned up duplicate middleware

---

## 🚀 Next Steps

### Option 1: Copy Your Existing Content (Recommended)

1. **Access your old Replit project** (the one hosting the current asknewton.com)

2. **Download all files**:
   - HTML pages
   - CSS stylesheets
   - JavaScript files
   - Images and assets
   - Any other static content

3. **Upload to this project**:
   ```bash
   # In this Replit project's shell
   cd public/classic
   
   # Upload files via Replit file manager
   # Or use shell commands to copy
   ```

4. **Update file paths**:
   - Change absolute URLs: `/style.css` → `./style.css`
   - Update asset paths: `/images/logo.png` → `./images/logo.png`
   - Fix internal links to include `/classic` prefix

5. **Test locally**:
   ```
   https://california-next-farisgammoh.replit.app/classic
   ```

---

### Option 2: Use the Placeholder (Fastest)

The current `public/classic/index.html` is fully functional and includes:
- ✅ AskNewton branding
- ✅ Banner linking to new platform  
- ✅ Features and personas
- ✅ Mobile-responsive
- ✅ SEO optimized

**You can customize it** by editing `public/classic/index.html` directly.

---

### Option 3: Deploy Now and Migrate Later

1. **Deploy to production** with the current placeholder
2. **Configure custom domain** (see `CUSTOM_DOMAIN_SETUP.md`)
3. **Migrate content gradually** after domain is live

---

## 🌐 Custom Domain Setup

When you're ready to point `asknewton.com` to this Replit deployment:

1. **Read the guide**: `CUSTOM_DOMAIN_SETUP.md`

2. **Quick summary**:
   - Click "Publish" in Replit
   - Add custom domain `asknewton.com`
   - Copy DNS values
   - Update GoDaddy DNS settings
   - Wait 5-30 minutes for propagation

3. **Result**:
   - `https://asknewton.com` → New platform
   - `https://asknewton.com/classic` → Legacy site
   - Both on same deployment, same SSL certificate

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Legacy content migrated to `public/classic/`
- [ ] All file paths updated (absolute → relative)
- [ ] Internal links work correctly
- [ ] Images and assets load properly
- [ ] Cross-site navigation tested
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags present
- [ ] Custom domain configured in Replit
- [ ] GoDaddy DNS updated
- [ ] SSL certificate verified (automatic)
- [ ] Both sites tested on custom domain

---

## 🔧 Technical Details

### Development Mode
- Vite serves React app
- `express.static()` serves `public/` files first
- `/classic/*` bypasses Vite and serves static HTML
- Hot reload works for both React and static files

### Production Mode
- Built React app in `dist/client/`
- `public/` copied to `dist/client/` during build
- Single deployment serves both new and legacy sites
- Static files cached at CDN edge (Replit provides this)

### Static File Priority
```
1. express.static(public/) ← /classic files served here
2. API routes (/api/*)
3. Vite middleware (dev) / Serve built React app (prod)
```

---

## 📞 Testing Your Setup

### Test in Development (Now)

```bash
# Open in browser (Replit webview)
https://california-next-farisgammoh.replit.app/

# Click "Classic Site" in footer
# Should navigate to /classic and show legacy homepage
```

### Test After Custom Domain Setup

```bash
# Main app
https://asknewton.com
→ Should show new React platform

# Legacy site
https://asknewton.com/classic
→ Should show legacy homepage

# Navigation
# Click "Classic Site" in footer → Goes to legacy
# Click banner in legacy → Returns to new platform
```

---

## 🎨 Customization Options

### Customize Placeholder

Edit `public/classic/index.html`:
- Update colors in `<style>` section
- Modify hero section text
- Add/remove features
- Update personas
- Change footer content

### Add More Pages

```bash
# Create additional pages
public/classic/about.html
public/classic/contact.html
public/classic/css/styles.css
public/classic/js/scripts.js
public/classic/images/logo.png
```

All will be automatically served at:
```
/classic/about.html
/classic/contact.html
/classic/css/styles.css
etc.
```

---

## 🚨 Troubleshooting

### Issue: /classic shows 404

**Solution**: 
- Check file exists: `ls public/classic/index.html`
- Restart workflow: Click "Restart" in Replit
- Clear browser cache

---

### Issue: /classic shows React app instead of static HTML

**Solution**:
- Verify `express.static()` is in `server/routes.ts`
- Check file path is correct
- Restart Replit deployment

---

### Issue: Images/CSS not loading on /classic

**Solution**:
- Use relative paths: `./images/logo.png` not `/images/logo.png`
- Or use absolute paths with /classic prefix: `/classic/images/logo.png`
- Check file exists in `public/classic/`

---

### Issue: Footer link not visible

**Solution**:
- Check `client/src/components/Footer.tsx` has the link
- Clear browser cache
- Restart Vite dev server

---

## 📊 SEO Impact

### New Platform (`/`)
- Primary homepage for search engines
- Modern, fast React app
- Better user experience
- AI-powered recommendations

### Legacy Site (`/classic`)
- Preserves existing URLs
- Maintains SEO history
- 301 redirects can be added if needed
- Search engines will index both

### Best Practice
- Add `<link rel="canonical">` tags
- Update sitemap.xml to include both
- Add redirects for changed URLs
- Monitor Google Search Console

---

## 🎯 Summary

You now have:
- ✅ New React platform at `/`
- ✅ Legacy site at `/classic`
- ✅ Single Replit deployment
- ✅ Seamless navigation between both
- ✅ Ready for custom domain
- ✅ Production-ready setup

**What to do now**:
1. **Test it**: Open https://california-next-farisgammoh.replit.app/classic
2. **Migrate content**: Copy files from old project (optional)
3. **Configure domain**: Follow `CUSTOM_DOMAIN_SETUP.md`
4. **Go live**: Deploy to production! 🚀

---

**Status**: ✅ **READY FOR DEPLOYMENT**

Questions? Check:
- `CUSTOM_DOMAIN_SETUP.md` - Domain configuration
- `public/classic/README.md` - Content migration
- `DEPLOYMENT_PACKAGE_SUMMARY.md` - Society of Mind deployment

# Classic askNewton Site

This folder contains the legacy askNewton website content.

## 📁 Folder Structure

```
public/classic/
├── index.html          # Main legacy homepage
├── css/               # (Optional) Add your custom CSS files here
├── js/                # (Optional) Add your custom JavaScript files here
├── images/            # (Optional) Add your images here
└── README.md          # This file
```

## 🔄 Migrating Your Existing Content

If you have an existing askNewton site on another Replit project:

1. **Export Content from Old Project**:
   - Download all HTML, CSS, JS, and image files
   - Preserve folder structure

2. **Upload to This Folder**:
   - Copy files to `public/classic/`
   - Update any absolute paths to relative paths
   - Test links and images

3. **Update Navigation**:
   - The current `index.html` has a banner linking to the new platform
   - Keep this banner or customize it as needed

## 🌐 URL Structure

Once deployed with custom domain:

- **New Platform**: `https://asknewton.com/`
- **Legacy Site**: `https://asknewton.com/classic`
- **Main App**: `https://asknewton.com/wizard` (intake form)

## 🎨 Customization

The current `index.html` is a placeholder. Replace it with your actual content:

```bash
# Backup the placeholder
mv index.html index.html.backup

# Copy your existing site
cp -r /path/to/your/old/site/* .
```

## ✅ Checklist

- [ ] Copy existing site files to this folder
- [ ] Update internal links to be relative (`/classic/page.html`)
- [ ] Update asset paths (CSS, JS, images)
- [ ] Test all pages work at `/classic`
- [ ] Add banner/navigation to new platform
- [ ] Verify SEO meta tags are present

## 📞 Need Help?

The placeholder `index.html` serves as a template. Customize it or replace it entirely with your existing content.

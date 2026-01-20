# 🚀 Vercel Deployment Guide

## MDRRMO Pio Duran File Inventory & Management System

This guide provides step-by-step instructions for deploying your application to Vercel.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. ✅ **GitHub Account** - Your code should be in a GitHub repository
3. ✅ **Google Cloud API Keys** - For Google Drive and Sheets access
4. ✅ **Git Installed** - To push code to GitHub

---

## 🏗️ Architecture Overview

This deployment is **frontend-only** since the application uses direct API calls to Google services:

```
Vercel (Frontend) → Direct HTTPS → Google Cloud APIs
                                    ├─ Google Drive API
                                    └─ Google Sheets API
```

**No backend deployment needed!** All data operations happen directly from the frontend.

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository (if not already done)

```bash
cd /app
git init
git add .
git commit -m "Initial commit: MDRRMO Pio Duran System"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `mdrrmo-pio-duran`
3. Choose visibility (Public or Private)
4. Do NOT initialize with README (already exists)

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/mdrrmo-pio-duran.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `mdrrmo-pio-duran`
4. Click **"Import"**

### 2.2 Configure Project Settings

Vercel will auto-detect the configuration from `vercel.json`. Verify these settings:

**Framework Preset:** `Create React App`
**Root Directory:** `./` (project root)
**Build Command:** `cd frontend && yarn build`
**Output Directory:** `frontend/build`
**Install Command:** `cd frontend && yarn install`

### 2.3 Configure Environment Variables

⚠️ **CRITICAL STEP**: Add these environment variables in Vercel Dashboard

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `REACT_APP_GOOGLE_DRIVE_API_KEY` | Your Google Drive API Key | Production, Preview, Development |
| `REACT_APP_GOOGLE_SHEETS_API_KEY` | Your Google Sheets API Key | Production, Preview, Development |
| `REACT_APP_GOOGLE_SHEET_ID` | Your Google Sheet ID | Production, Preview, Development |

**How to get these values:**

**Google Drive API Key:**
```
Current Value: AIzaSyCDcthLGNPlbMr4AFzuK5tl0CMTzsQI9EI
```

**Google Sheets API Key:**
```
Current Value: AIzaSyBTZH_0wi2svXNNQX696bA2Knj_7VXZ4CM
```

**Google Sheet ID:**
```
Current Value: 1UtT9t2LZ5NEc-wbGv44mDeDjWLxOLBQHA5yy6jiLc7E
```

3. Click **"Save"** for each variable

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://mdrrmo-pio-duran.vercel.app`

---

## 🔧 Step 3: Configure Google Cloud API Restrictions

### 3.1 Update API Key Restrictions

Once you have your Vercel URL, update your Google Cloud Console API restrictions:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Click on your API Key
4. Under **Application restrictions**, select **HTTP referrers (web sites)**
5. Add these referrers:
   ```
   https://mdrrmo-pio-duran.vercel.app/*
   https://*.vercel.app/*
   localhost:3000/*
   ```
6. Under **API restrictions**, ensure these APIs are enabled:
   - Google Drive API
   - Google Sheets API
7. Click **Save**

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Your Application

Visit your Vercel URL and verify:

- [ ] Dashboard loads correctly
- [ ] All 8 modules are accessible
- [ ] Supply Inventory displays data from Google Sheets
- [ ] Contact Directory displays data from Google Sheets
- [ ] Calendar Management displays data from Google Sheets
- [ ] Document Management displays files from Google Drive
- [ ] Photo Documentation displays images from Google Drive
- [ ] Map Management displays map files
- [ ] Panorama Gallery displays 360° images
- [ ] Interactive Map (Leaflet) works

### 4.2 Check Console for Errors

1. Open browser DevTools (F12)
2. Check Console tab for any errors
3. Common issues:
   - **API Key errors**: Verify environment variables in Vercel
   - **CORS errors**: Check Google Cloud API restrictions
   - **404 errors**: Ensure routing is correct

---

## 🔄 Step 5: Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

### 5.1 Make Changes

```bash
# Make your changes locally
git add .
git commit -m "Update: description of changes"
git push origin main
```

### 5.2 Automatic Deployment

- Vercel detects the push and starts a new deployment
- You'll receive an email when deployment completes
- Preview deployments are created for pull requests

---

## 📊 Step 6: Monitor and Optimize

### 6.1 Analytics

- Go to your Vercel Dashboard → Analytics
- Monitor page views, performance, and errors

### 6.2 Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image optimization
- ✅ Gzip/Brotli compression
- ✅ HTTP/2

### 6.3 Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Google Cloud API restrictions with your domain

---

## 🐛 Troubleshooting

### Build Fails

**Error: `yarn: command not found`**
```bash
# Solution: Vercel uses yarn by default, ensure package.json is correct
# Already configured in vercel.json
```

**Error: `Module not found`**
```bash
# Solution: Clear Vercel build cache
# Vercel Dashboard → Deployments → Three dots → "Redeploy"
```

### Runtime Errors

**Error: `API Key not configured`**
```bash
# Solution: Check environment variables in Vercel
# Settings → Environment Variables
# Ensure variables are set for Production environment
```

**Error: `Failed to load data from Google Sheets/Drive`**
```bash
# Solution: Verify API keys are correct
# Check Google Cloud Console → Credentials
# Ensure APIs are enabled
# Verify API key restrictions include your Vercel domain
```

### CORS Errors

**Error: `Access-Control-Allow-Origin`**
```bash
# Solution: Update Google Cloud API key restrictions
# Add your Vercel domain to HTTP referrers
```

---

## 🔐 Security Best Practices

### Environment Variables

- ✅ **NEVER** commit API keys to Git
- ✅ Use Vercel Environment Variables for sensitive data
- ✅ Use different API keys for Production and Development
- ✅ Rotate API keys periodically

### API Key Restrictions

- ✅ Restrict API keys to specific domains (HTTP referrers)
- ✅ Restrict API keys to specific APIs (Drive, Sheets only)
- ✅ Set daily quota limits
- ✅ Monitor API usage in Google Cloud Console

### Google Sheets Permissions

- ✅ Ensure sheets are publicly readable (or shared with API key)
- ✅ Use read-only access (API keys can't write)
- ✅ Separate sensitive data into different sheets

---

## 📈 Production Checklist

Before going live, verify:

- [ ] All environment variables configured in Vercel
- [ ] Google Cloud API keys have proper restrictions
- [ ] All modules tested and working
- [ ] Console shows no errors
- [ ] Performance is acceptable (Lighthouse score > 90)
- [ ] Custom domain configured (if applicable)
- [ ] Analytics setup
- [ ] Error monitoring enabled
- [ ] Team members have access to Vercel project
- [ ] Documentation updated with production URLs

---

## 🚀 Quick Deployment Commands

```bash
# One-time setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/mdrrmo-pio-duran.git
git push -u origin main

# Import to Vercel (via dashboard)
# Configure environment variables (via dashboard)

# Future updates
git add .
git commit -m "Update: description"
git push origin main
# Vercel auto-deploys!
```

---

## 📞 Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
- **React Documentation**: [react.dev](https://react.dev)

---

## 🎉 Success!

Your MDRRMO Pio Duran File Inventory & Management System is now deployed on Vercel!

**Deployment URL**: `https://mdrrmo-pio-duran.vercel.app` (or your custom domain)

---

## 📝 Notes

- **No backend required**: All data comes directly from Google APIs
- **Automatic scaling**: Vercel handles traffic spikes automatically
- **Zero downtime**: Deployments don't affect live site
- **Preview deployments**: Every PR gets its own URL for testing
- **Cost**: Vercel's Hobby plan is free for personal projects

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready

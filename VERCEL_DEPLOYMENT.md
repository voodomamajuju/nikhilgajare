# 🚀 Deploy to Vercel - Complete Guide

This guide will help you deploy your frontend to Vercel.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
3. **Backend Deployed** - Your backend API should be deployed separately (Railway, DigitalOcean, etc.)

---

## 🎯 Quick Deployment (5 minutes)

### Step 1: Push to GitHub

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (or **"Log In"** if you have an account)
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub repositories

### Step 3: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your repository (`nikhilgajare`)
3. Click **"Import"**

### Step 4: Configure Project

Vercel will auto-detect your settings, but verify:

- **Framework Preset:** Other
- **Root Directory:** `./` (root)
- **Build Command:** `npm run build:config` (already set in vercel.json)
- **Output Directory:** `.` (root)
- **Install Command:** `npm install`

### Step 5: Add Environment Variables (if needed)

If your build script requires environment variables, add them:

1. In the project settings, go to **"Environment Variables"**
2. Add any variables your build script needs
3. For production, make sure to set the correct values

**Note:** Since you're using a custom backend, you may not need Supabase variables. Your `config.api.js` should point to your deployed backend URL.

### Step 6: Deploy!

1. Click **"Deploy"**
2. Wait 30-60 seconds
3. Your site will be live! 🎉

---

## 🔧 Configuration

The `vercel.json` file is already configured with:

- ✅ Root redirect to `/login.html`
- ✅ Security headers (XSS protection, frame options, etc.)
- ✅ Cache headers for static assets
- ✅ HTTPS redirect (automatic on Vercel)
- ✅ Build command setup

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your project dashboard
2. Click **"Settings"** → **"Domains"**
3. Enter your domain (e.g., `ngcouturemodels.in`)
4. Click **"Add"**

### Step 2: Configure DNS

Vercel will show you DNS records to add. Update your domain's DNS:

**For root domain (`ngcouturemodels.in`):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Or use Vercel's nameservers:**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### Step 3: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Usually takes 5-30 minutes
- Vercel will show status: "Valid Configuration" when ready

### Step 4: SSL Certificate

- Vercel automatically provisions SSL certificates
- HTTPS is enabled automatically
- No additional setup needed!

---

## 🔗 Backend Configuration

Your frontend needs to point to your deployed backend. Update `config.api.js`:

```javascript
// For production
export const API_URL = 'https://your-backend-domain.com/api';
export const BASE_URL = 'https://your-backend-domain.com';
```

**Or use environment variables:**

1. In Vercel dashboard, go to **"Environment Variables"**
2. Add:
   - `VITE_API_URL` = `https://your-backend-domain.com/api`
   - `VITE_BASE_URL` = `https://your-backend-domain.com`

The `config.api.js` file already supports these environment variables!

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Main branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Preview deployments with unique URLs

**No manual deployment needed!** Just push to GitHub.

---

## 📊 Monitoring & Analytics

### View Deployments

1. Go to your project dashboard
2. See all deployments with:
   - Build logs
   - Deployment status
   - Preview URLs

### Analytics (Pro Plan)

- Built-in analytics dashboard
- Real-time visitor stats
- Performance metrics
- Free tier includes basic analytics

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build command fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure `package.json` has `build:config` script
3. Check if environment variables are set correctly

### 404 Errors

**Issue:** Pages return 404

**Solution:**
1. Verify `vercel.json` has correct redirects
2. Check that HTML files are in the root directory
3. Ensure file names match exactly (case-sensitive)

### API Calls Fail

**Issue:** Frontend can't connect to backend

**Solution:**
1. Update `config.api.js` with correct backend URL
2. Check CORS settings on backend
3. Verify backend is deployed and accessible
4. Check browser console for errors

### Environment Variables Not Working

**Issue:** Environment variables not available

**Solution:**
1. Add variables in Vercel dashboard (Settings → Environment Variables)
2. Redeploy after adding variables
3. Use `VITE_` prefix for Vite projects (if applicable)

---

## 💰 Pricing

### Free Tier (Perfect for you!)

- ✅ **100GB bandwidth/month** (more than enough for 1,000 users)
- ✅ **Unlimited deployments**
- ✅ **Unlimited build minutes**
- ✅ **Free SSL certificates**
- ✅ **Custom domains**
- ✅ **Preview deployments**

**Cost: $0/month** 🎉

### When to Upgrade

Upgrade to Pro ($20/month) if you need:
- More bandwidth (1TB)
- Team collaboration
- Advanced analytics
- Priority support

**For 1,000 users/month, free tier is perfect!**

---

## ✅ Deployment Checklist

Before deploying:

- [ ] Code pushed to GitHub
- [ ] `vercel.json` file created
- [ ] Backend deployed and accessible
- [ ] `config.api.js` updated with backend URL
- [ ] Environment variables set (if needed)
- [ ] Test locally first

After deploying:

- [ ] Visit deployment URL
- [ ] Test login functionality
- [ ] Test API connections
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Add custom domain (optional)

---

## 🎯 Next Steps

1. **Deploy Backend** (if not done):
   - Use Railway ($5/month) - easiest
   - Or DigitalOcean ($6/month) - more control
   - See `SETUP_1000_USERS.md` for details

2. **Update Frontend Config**:
   - Point `config.api.js` to your backend URL

3. **Test Everything**:
   - Login/Register
   - File uploads
   - All features

4. **Add Custom Domain** (optional):
   - Follow domain setup steps above

---

## 📞 Need Help?

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify backend is accessible
4. Review `vercel.json` configuration

**Common Issues:**
- Build fails → Check build logs
- 404 errors → Check redirects in vercel.json
- API errors → Check backend URL in config.api.js
- CORS errors → Check backend CORS settings

---

## 🎉 Summary

**Deploying to Vercel is simple:**

1. Push to GitHub ✅
2. Connect to Vercel ✅
3. Click Deploy ✅
4. Done! 🎉

**Total time: 5 minutes**

Your site will be live with:
- ✅ Free SSL certificate
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Preview URLs for PRs
- ✅ Custom domain support

**Perfect for 1,000 users/month!** 🚀


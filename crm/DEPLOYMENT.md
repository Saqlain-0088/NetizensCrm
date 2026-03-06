# Vercel Deployment Fix for ENOENT Error

## Error
```
ENOENT: no such file or directory, mkdir '/var/task/crm/public'
```

## Root Directory is Already "crm"

If Root Directory is already set to `crm` and the error persists, try these steps:

### 1. Clear Build Cache and Redeploy
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → your project
2. Go to **Deployments**
3. Click the **⋮** menu on the latest deployment
4. Select **Redeploy**
5. **Enable "Clear cache and redeploy"** (checkbox)
6. Click **Redeploy**

### 2. Check "Include source files outside of the Root Directory"
1. **Settings** → **General**
2. Find **Include source files outside of the Root Directory**
3. If it is **enabled**, try **disabling** it and redeploy
4. This can change how paths are resolved in the deployment

### 3. Verify Build Output
1. After a deploy, check the **Build Logs**
2. Confirm the build runs from the `crm` folder
3. Confirm there are no path-related warnings

### 4. Alternative: Deploy from crm-Only Repo
If the repo root is "CRM Application" with a `crm` subfolder, consider:
- Creating a separate repo that contains only the `crm` folder contents, or
- Using a Vercel project that points directly to the `crm` folder as the repo root

# Matrix API Tester - Deployment Instructions

## 🚀 Deploy to Vercel (Recommended)

### Method 1: Direct GitHub Deploy (Easiest)

1. **Create GitHub Repository:**
   ```bash
   # Create a new directory and initialize git
   mkdir matrix-api-tester
   cd matrix-api-tester
   git init
   ```

2. **Add Project Files:**
   Copy all the provided files into your project directory:
   ```
   matrix-api-tester/
   ├── pages/
   │   ├── api/
   │   │   ├── ping.js
   │   │   ├── encode.js
   │   │   ├── encode-batch.js
   │   │   └── redeploy.js
   │   ├── _app.js
   │   └── index.js
   ├── styles/
   │   └── globals.css
   ├── .env.local            ← Add your secrets here
   ├── package.json
   ├── tailwind.config.js
   ├── postcss.config.js
   └── next.config.js
   ```

3. **Setup Environment Variables:**
   Create a `.env.local` file in your project root:
   ```bash
   # .env.local
   RENDER_DEPLOY_KEY=your_secret_render_deploy_key_here
   NEXT_PUBLIC_MATRIX_API_URL=https://the-matrix-server.onrender.com
   ```

4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit: Matrix API Tester"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/matrix-api-tester.git
   git push -u origin main
   ```

5. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `matrix-api-tester` repository
   - **IMPORTANT**: Add environment variables in Vercel:
     - Go to Project Settings → Environment Variables
     - Add: `RENDER_DEPLOY_KEY` = `your_secret_key`
     - Add: `NEXT_PUBLIC_MATRIX_API_URL` = `https://the-matrix-server.onrender.com`
   - Click "Deploy"
   - Done! 🎉

## 🔒 Environment Variables Setup

### **For Local Development:**
```bash
# .env.local (never commit this file!)
RENDER_DEPLOY_KEY=rnd_your_secret_key_here
NEXT_PUBLIC_MATRIX_API_URL=https://the-matrix-server.onrender.com
```

### **For Vercel Deployment:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   ```
   RENDER_DEPLOY_KEY = rnd_your_secret_key_here
   NEXT_PUBLIC_MATRIX_API_URL = https://the-matrix-server.onrender.com
   ```
4. Redeploy your project

### **Environment Variable Types:**
- `RENDER_DEPLOY_KEY`: Server-side only (secure) - Used in API routes
- `NEXT_PUBLIC_*`: Client-side accessible - Used in frontend components

## 🔑 How the Deploy Key Works:

1. **Priority System**: 
   - If user provides a key in the form → Use that
   - If no key provided → Use `process.env.RENDER_DEPLOY_KEY`
   - If neither → Request without authentication

2. **Security**: 
   - Environment variables are only accessible on the server
   - Your secret key never reaches the browser
   - API routes act as secure proxies

3. **Usage**:
   ```javascript
   // In pages/api/redeploy.js
   const authKey = deployKey || process.env.RENDER_DEPLOY_KEY;
   ```

### Method 2: Vercel CLI Deploy

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Setup Project:**
   ```bash
   mkdir matrix-api-tester
   cd matrix-api-tester
   # Copy all the files here
   ```

3. **Create .env.local:**
   ```bash
   echo "RENDER_DEPLOY_KEY=your_key_here" > .env.local
   ```

4. **Install Dependencies:**
   ```bash
   npm install
   ```

5. **Test Locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

6. **Deploy:**
   ```bash
   vercel
   # Add environment variables when prompted
   vercel env add RENDER_DEPLOY_KEY
   ```

## 🌟 Features of This New Version

✅ **Zero CORS Issues** - Built-in Next.js API handling  
✅ **Secure Environment Variables** - Server-side secret management  
✅ **Performance Benchmarking** - Detailed metrics tracking  
✅ **Modern React Hooks** - Clean state management  
✅ **Responsive Design** - Works on all devices  
✅ **Real-time Feedback** - Loading states and timestamps  
✅ **Matrix-themed UI** - Dark theme with green accents  
✅ **Auto-deployment** - Vercel handles everything  

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 📝 Complete Environment Variables List

```bash
# .env.local
# Render Deploy Key (required for redeploy functionality)
RENDER_DEPLOY_KEY=rnd_your_secret_deploy_key_here

# Matrix API URL (optional, has default)
NEXT_PUBLIC_MATRIX_API_URL=https://the-matrix-server.onrender.com

# Render Deploy URL (optional, has default)
NEXT_PUBLIC_DEPLOY_API_URL=https://api.render.com/deploy
```

## 🚨 Security Notes

- **Never commit `.env.local`** to version control
- Add `.env.local` to your `.gitignore` file
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Server-only variables (like `RENDER_DEPLOY_KEY`) remain secure on the server
- Always use the Vercel dashboard to set production environment variables

## 🎯 Quick Deploy Summary

1. Copy all files to a new folder
2. Create `.env.local` with your secrets
3. Push to GitHub (excluding .env.local)
4. Connect to Vercel
5. Add environment variables in Vercel dashboard
6. Deploy automatically
7. Done! 🎉

Your Matrix API Tester will be live with secure environment variable handling!
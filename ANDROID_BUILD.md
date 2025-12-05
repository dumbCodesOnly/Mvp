# CloudMiner Android App Build Guide

This guide explains how to build the CloudMiner Android app from source using Capacitor.

## Prerequisites

Before building the Android app, you'll need:

1. **Android Studio** installed on your computer
   - Download from: https://developer.android.com/studio
   - During installation, make sure to install:
     - Android SDK
     - Android SDK Platform-Tools
     - Android Virtual Device (AVD)

2. **Java Development Kit (JDK) 17+**
   - Usually installed automatically with Android Studio

3. **Node.js 18+** and npm

## Project Structure

The Android app source is located in:
```
frontend/
├── android/              # Native Android project
├── capacitor.config.ts   # Capacitor configuration
├── resources/           # App icon and splash screen assets
└── dist/                # Built web app (copied to Android)
```

## Building the App

### Step 1: Build the Web App

First, build the production version of the React app:

```bash
cd frontend
npm install
npm run build
```

### Step 2: Sync with Android

Copy the web assets to the Android project:

```bash
npx cap sync android
```

### Step 3: Open in Android Studio

Open the Android project in Android Studio:

```bash
npx cap open android
```

Or manually open the `frontend/android` folder in Android Studio.

### Step 4: Configure the API URL

Before building the Android APK, set the production API URL environment variable:

```bash
# Set your deployed API URL (replace with your actual domain)
export VITE_API_URL=https://your-production-domain.com

# Then rebuild and sync
npm run build
npx cap sync android
```

**Important:** The `VITE_API_URL` must point to your deployed backend API. 
- For Replit deployments, this is your published app URL (e.g., `https://your-app.replit.app`)
- If not set, the app will use relative URLs which work for web deployments but not for Android

### Step 5: Build the APK

In Android Studio:

1. Wait for Gradle to sync (automatic)
2. Select **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Wait for the build to complete
4. Click "locate" to find your APK

**APK Location:** `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Step 6: Build a Release APK (for Play Store)

For a signed release APK:

1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Select **APK**
3. Create a new keystore or use an existing one
4. Follow the wizard to complete signing

**Release APK Location:** `frontend/android/app/build/outputs/apk/release/app-release.apk`

## Testing the App

### Using an Emulator

1. In Android Studio, go to **Tools → Device Manager**
2. Create a new virtual device
3. Click the play button to run the app

### Using a Physical Device

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect your device via USB
4. Select your device in Android Studio and click Run

## App Configuration

### App ID and Name

The app is configured in `frontend/capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.cloudminer.app',     // Package name
  appName: 'CloudMiner',            // App display name
  webDir: 'dist',
  // ...
};
```

### Changing the App Icon

1. Place your icon files in the `android/app/src/main/res/` folder:
   - `mipmap-mdpi/ic_launcher.png` (48x48)
   - `mipmap-hdpi/ic_launcher.png` (72x72)
   - `mipmap-xhdpi/ic_launcher.png` (96x96)
   - `mipmap-xxhdpi/ic_launcher.png` (144x144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

2. Or use Android Studio's **Asset Studio**:
   - Right-click `res` folder → **New → Image Asset**
   - Select your icon source and generate all sizes

### Splash Screen

The splash screen is configured in Capacitor config. To customize:

1. Update colors in `capacitor.config.ts`
2. Add custom splash resources to `android/app/src/main/res/drawable/`

## Updating the App

When you make changes to the React app:

```bash
# 1. Build the web app
cd frontend
npm run build

# 2. Sync with Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. Build new APK
```

## Troubleshooting

### White Screen on Launch
- Check that `webDir` in capacitor.config.ts matches your build output folder
- Verify the build completed successfully

### API Calls Not Working
- Ensure your API URL is correct in production config
- Check that CORS is enabled on your backend
- For HTTPS issues, make sure your server has a valid SSL certificate

### Build Errors
- Run `npx cap sync android` to ensure all assets are copied
- Clean the project: **Build → Clean Project** in Android Studio
- Invalidate caches: **File → Invalidate Caches / Restart**

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)

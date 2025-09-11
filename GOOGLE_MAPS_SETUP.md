# Google Maps API Setup Guide

## Current Issue
The app is currently showing `REQUEST_DENIED` errors because the Google Maps API key needs to be properly configured.

## Quick Fix (Fallback Mode)
The app now includes fallback locations for Sri Lanka, so it will work even without the API key. You can test the app with these predefined locations:
- Colombo
- Kandy
- Galle
- Sigiriya
- Anuradhapura
- Trincomalee
- Nuwara Eliya
- Bentota

## To Enable Full Google Maps Integration

### 1. Get a Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
   - Maps JavaScript API
   - Directions API

### 2. Create API Key
1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key

### 3. Configure API Key Restrictions (Recommended)
1. Click on your API key to edit it
2. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:3000/*`, `*.yourdomain.com/*`)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose the APIs you enabled above

### 4. Update the API Key in Your App
Replace the API key in `services/apiConfig.ts`:

```typescript
GOOGLE_MAPS: {
  API_KEY: 'YOUR_ACTUAL_API_KEY_HERE', // Replace this
  // ... rest of config
},
```

### 5. Test the Integration
1. Restart your development server
2. Try searching for locations in the app
3. Check the console for any remaining errors

## API Key Security Best Practices

### For Development
- Use a separate API key for development
- Restrict it to localhost and your development domains
- Monitor usage in Google Cloud Console

### For Production
- Use a different API key for production
- Set up proper domain restrictions
- Consider using environment variables to store the key
- Monitor usage and set up billing alerts

## Environment Variables (Recommended)
Instead of hardcoding the API key, you can use environment variables:

1. Create a `.env` file in your project root:
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Update `services/apiConfig.ts`:
```typescript
GOOGLE_MAPS: {
  API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'fallback-key',
  // ... rest of config
},
```

3. Add `.env` to your `.gitignore` file to keep the key secure.

## Troubleshooting

### Common Issues
1. **REQUEST_DENIED**: API key is invalid or doesn't have required permissions
2. **QUOTA_EXCEEDED**: You've exceeded the free tier limits
3. **INVALID_REQUEST**: The request format is incorrect

### Debug Steps
1. Check the API key is correct
2. Verify the APIs are enabled
3. Check the API key restrictions
4. Look at the Google Cloud Console logs
5. Test the API key directly in a browser

## Current Status
✅ App works with fallback locations
⏳ Google Maps API integration pending proper API key setup
✅ Map visualization works with fallback data
✅ Location search works with predefined locations

The app is fully functional even without the Google Maps API key, but you'll get better location search results once the API is properly configured.

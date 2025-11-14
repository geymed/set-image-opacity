# Image Opacity Controller

A web application that allows you to upload images, control their opacity, and set a background color that shows through the transparency. Perfect for creating images with custom opacity effects.

## Features

- 📤 **Multiple Image Upload**: Upload one or multiple images at once
- 🎚️ **Opacity Control**: Adjust opacity from 0% to 100% with a slider
- 🎨 **Background Color Picker**: Choose any background color (default: white) that shows through transparency
- 💾 **Download Images**: Download individual processed images or all at once
- 🗑️ **Remove Images**: Remove images from the list as needed

## Getting Started

### Installation

```bash
yarn install
```

### Development

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
yarn build
yarn start
```

## Deployment to Vercel

This project is configured for easy deployment to Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and yarn (via `yarn.lock`) and deploy your app

The `vercel.json` file is included for optimal Vercel configuration with yarn.

## How It Works

1. Upload one or more images using the file input
2. Adjust the opacity slider to control transparency (0% = fully transparent, 100% = fully opaque)
3. Select a background color that will show through transparent areas
4. Preview the processed images in real-time
5. Download individual images or all images at once

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Canvas API** - Client-side image processing
- **Vercel** - Deployment platform

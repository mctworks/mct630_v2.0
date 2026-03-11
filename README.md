# MCT630.com (Version 2.0)

**Live Site**: [https://mct630.com](https://mct630.com)  
**Staging**: [https://mct630-v2-0.vercel.app](https://mct630-v2-0.vercel.app)

## Tech Stack

- **Framework**: Next.js 15, React 19
- **Language**: TypeScript
- **CMS/Editor**: Makeswift, Contentful
- **Styling**: Tailwind CSS
- **Animations**: GSAP
- **Data Fetching**: SWR, GraphQL
- **Hosting/Deployment**: Vercel

## Project Overview

MCT630.com is a portfolio and blog platform built on a Makeswift/Contentful foundation. The project started from the [Makeswift/Contentful workshop at RenderATL 2025](https://github.com/jamesqquick/makeswift-contentful-workshop) and has been customized into a full-featured site with custom components, page transitions, and animation systems.

## Core Components

### ThemeConfig
Handles dark/light theme switching with system preference detection. Manages theme-aware color variables throughout the application.

### NavMenuPlus
A navigation component built on react-burger-menu with GSAP animations. Features:
- Mobile-first responsive design with different behaviors across breakpoints
- Animated menu transitions with content scaling effects
- Fully editable links through Makeswift's visual editor
- Dynamic scrolling text that reflects current page location

### TransitionLink
A link wrapper component that triggers page transitions. Two animation types available:

- **"Actraiser Drop"** – Zooms in on the clicked element with a slight rotation
- **"Logo Splash"** – Animates SVG color properties while zooming

All animation parameters (scale, rotation, duration, easing) are configurable through Makeswift's property panel.

### EnhancedSVG
A component system for SVG manipulation that provides:
- Dynamic recoloring based on current theme
- Configurable line-draw GSAP animations for specified paths
- Animation controls for speed, duration, delay, and path selection via Makeswift editor

### Blog Components
Modified from the original workshop foundation to incorporate TransitionLink and EnhancedSVG functionality. Features:
- Content managed through Contentful
- Animated card layouts
- Fully editable blog slugs
- Custom animation controls for cards and indicators

### Portfolio Components
Built by extending the blog architecture with:
- Dedicated Contentful content type
- Consistent animation patterns
- Makeswift-editable behavior controls

## Animation System

All animations are built with GSAP and include reduced-motion considerations. When `prefers-reduced-motion` is enabled at the OS level, intensive transitions (Actraiser Drop, Logo Splash) automatically fall back to soft fades. A manual toggle is also available in the navigation bar.

## Development Environment

The project was developed under unconventional constraints, including development on SteamOS/ArchLinux. This influenced performance considerations and testing across different viewport sizes, including handheld device resolutions.

## Tooling

- **LLM Assistance**: GitHub Copilot for day-to-day queries, supplemented by Claude and DeepSeek for component-specific development
- **Documentation**: Makeswift developer documentation and AI assistant for platform-specific questions
- **Version Control**: Git

## Getting Started

```bash
# Clone the repository
git clone https://github.com/[username]/mct630-v2.git

# Install dependencies
npm install

# Set up environment variables
# Required:
# - MAKESWIFT_SITE_API_KEY
# - CONTENTFUL_SPACE_ID
# - CONTENTFUL_ACCESS_TOKEN

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the development environment.

## Environment Variables

```
MAKESWIFT_SITE_API_KEY=your_makeswift_api_key
CONTENTFUL_SPACE_ID=your_contentful_space_id
CONTENTFUL_ACCESS_TOKEN=your_contentful_access_token
```

## Project Status

**COMPLETED** - All major components and features are implemented and production-ready.

## License

MIT License

Copyright (c) 2026 Michael C. Thompson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

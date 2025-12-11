# MCT630 Version 2.0

PLEASE NOTE: This is a work in active development. Everything is absolutely subject to change, including this README. 

## Description

MCT630 Ver 2.0 is a portfolio/blog developed in React/Node.JS aimed at replacing my current portfolio. The version that's currently on my domain as of right now was thrown together very hastily with a jury-rigged free Webflow setup in three days back in late 2023 between between contract/freelance roles, and wasn't a fair representation of my work even back then, much less now. My aim is to create something that not only shows off my design skills, but also my skills as an engineer who can build out vibrant, accessible and responsive solutions for business and organizations that can be easily edited by a non-technical team member when needed.

This version implements a Makeswift/Contentful integration, using the Makeswift/Contentful workshop project by [James Q Quick](https://github.com/jamesqquick) at RenderATL in June 2025 as a starting point: https://github.com/jamesqquick/makeswift-contentful-workshop

## Demo
Everything pushed to this repo is running on Vercel for those interested in seeing it in action:
[MCT630 Ver. 2.0 WIP](https://mct630-v2-0.vercel.app/)

### CURRENT STATUS
* Most of the major components and more permanent assets have been built, enough to where I feel confident showing it off. You can see NavMenuPlus, animated SVGs via EnhancedSVG, and TransitionLink's "Actraiser Drop" animation (the section links with a light blue border) on the front page. 
* You can also see the progress on TransitionLink's "Logo Splash" animation by clicking the small MCT630 logo in the top left corner of the Nav bar.
* Blog with placeholder content is up, with the standard layout and animations on the blog post list page.
* Portfolio and About pages are currently test pages with dummy content.

## Components thus far...

### ThemeConfig

* Standard React component to handle Dark/Light theme colors (primarily text and background colors.)
* Includes a standard Dark/Light toggle Makeswift component, but can also detect system/browser preferences.

### NavMenuPlus

* Global Makeswift component with some visual bells and whistles over Makeswift's default header/nav
* Stylized menu that implements [react-buger-menu](https://github.com/negomi/react-burger-menu) as well as some GSAP animation.
* Accepts link targets as well as an image file via Makeswift editor for logos.
* Further functionality in progress, including intergration with...

### TransitionLink
* Makeswift component for a hyperlinked Box with transition effect on click
* One of two animations to choose from: Actraiser Drop and Logo Splash (Still in the works)
* Link target, div container attributes, as well as animation zoom-in scale and spin rotation easily adjusted in Makeswift editor mode 

### EnhancedSVG
* Makeswift component to handle properly optimized single-color SVGs
* Able to set a fill color for each Dark/Light mode seperately via Makeswift editor
* Optionally set a GSAP animation that traces either all or select SVG paths/strokes with two select animation gradient colors, via Makeswift editor mode.

## Blog
Work currently in progress. Utilizes a Contentful integration for content management. Mostly unchanged from the original workshop version as of now, but utilizes a custom Non-Makeswift component to handle animations.

## Portfolio
The portfolio will be similar to the blog, in that it implements a Contentful solution. Current gameplan is to spin it from the blog when the majority of that has been worked/reworked. Portfolio content will be handled seperately from Blog content.

## Other To-dos
* Adjust all GSAP animations for prefers-reduced-motion browser setting
* Content is being written when I'm not building

## Acknowledgments (WIP)
First, shoutouts go to the [Torc](https://www.torc.dev/) community, especially Jason Torres for giving me the swift kick in the butt I needed to get this project moving. I'd also like to thank Jason, as well as Taylor Desseyn, for providing feedback for this project.

I'd also like to thank the folks running [RenderATL](https://www.renderatl.com/), without which a lot of aspects of this
project wouldn't have ever happened. 

(still making this list...)
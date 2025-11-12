# MCT630 Version 2.0

PLEASE NOTE: This is a work in active development. Everything is absolutely subject to change, including this README. 

## Description

MCT630 Ver 2.0 is a portfolio/blog developed in React/Node.JS aimed at replacing my current portfolio. The version that's currently on my domain as of right now was thrown together very hastily with a jury-rigged free Webflow setup in three days back in late 2023 between between contract/freelance roles, and wasn't a fair representation of my work even back then, much less now. My aim is to create something that not only shows off my design skills, but also my skills as an engineer who can build out vibrant, accessible and responsive solutions for business and organizations that can be easily edited by a non-technical team member when needed.

This version implements a Makeswift/Contentful integration, using the Makeswift/Contentful workshop by [James Q Quick](https://github.com/jamesqquick) at RenderATL in June 2025 as a starting point: https://github.com/jamesqquick/makeswift-contentful-workshop

## Components thus far...

### ThemeConfig

* Standard React component to handle Dark/Light theme colors.
* Includes a standard Dark/Light toggle Makeswift component, but can also detect system/browser preferences.

### NavMenuPlus

* Global Makeswift component with some visual bells and whistles over Makeswift's default header/nav
* Stylized menu that implements [react-buger-menu](https://github.com/negomi/react-burger-menu) as well as some GSAP animation.
* Accepts link targets as well as an image file via Makeswift editor for logos.
* Further functionality in progress...

### ActraiserFall

* Makeswift component for a hyperlinked Box with a zoom-in and fade out/in transition effect whenever clicked
* Link target, div container attributes, as well as animation zoom-in scale and spin rotation easily adjusted in Makeswift editor mode 

### EnhancedSVG
* Makeswift component to handle properly optimized single-color SVGs
* Able to set a fill color for each Dark/Light mode seperately via Makeswift editor
* Optionally set a GSAP animation that traces either all or select SVG paths/strokes, as well as animation gradient colors, via Makeswift editor mode.

## Blog

Currently still the same as the original workshop's, but with the theme implemented. Work in progress. 

## Portfolio

The portfolio will be similar to the blog, in that it implements a Contentful solution. It will be spun from the blog when the majority of that has been worked/reworked. Portfolio content will be handled seperately from Blog content.

## Acknowledgments

Also a WIP (oh, I have a feeling that there's going to be a lot of them...)
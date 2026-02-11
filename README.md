# HTML Document Outline Validator

A Chromium browser extension to syntactically validate a page's heading usage (h1, h2, h3, etc)

**Table of Contents**

1. [Installation](#installation-and-use)
2. [How It Works](#how-it-works)
3. [Why It Is Important](#why-it-is-important)

## Installation and Use

### How to Install

1. Download this repository, unzip it, and save it somewhere on your filesystem
2. Open your Chromium web browser
3. Navigate to "Extensions" (Window > Extensions)
4. Enable "Developer mode" if it's not already enabled (typically a toggle in the top-right corner of the Extensions page)
5. Click the "Load Unpacked" button and open the unzipped directory

### How to Use

1. Navigate to the webpage you want to validate
2. Click the "Extensions" button (often a puzzle-piece icon to the right of the address bar)
3. Click "HTML Document Outline Validator"

## How It Works

### What It Checks

It checks that heading elements follow the pattern outlined in the HTML Spec:

- The first heading in a document must be an h1 or an h2
- Each subsequent heading's level must be less than, equal to, or (at most) one greater than the preceding heading's level (e.g., no h3 followed by h5)

Additionally it checks the widely accepted best practice that:

- There should only be one h1 on a page

### What It Doesn't Check

Automated testing can only catch certain types of errors. For instance, this doesn't verify that the content in the heading elements is semantically acting like a heading. And it doesn't check to make sure there's no content that's semantically acting as a heading but missing heading tags. And it doesn't verify that there are no document sections that are missing headings entirely.

## Why It Is Important

Proper heading usage and document outline structure is important for several reasons:

- **Accessibility:** Users of assistive technology often rely on a document's outline to quickly scan a page and navigate to the section they're looking for. A document with missing or malformed headings can make it very difficult for someone to interact with your content.
- **SEO / AEO / GEO:** Improper heading usage negatively impacts machines' abilities to understand your content. This effects indexers, webcrawlers, and AIs.


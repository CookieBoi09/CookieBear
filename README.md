# Astro Starter Kit: Blog

```sh
npm create astro@latest -- --template blog
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and Open Graph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).

## Memes

Open `/memes/` or choose **Memes** in the navigation. Manage the galleries in VS Code by adding folders and images under `public/Meme's folder/`:

```text
public/
└── Meme's folder/
    ├── Cats/
    │   ├── sleepy-cat.jpg
    │   └── Reactions/
    │       └── surprised.gif
    └── Programming/
        └── works-on-my-machine.png
```

Each directory becomes a folder card using its exact name. Opening it shows its
images and any subfolders; breadcrumbs and a back link let visitors move up the
hierarchy. Images directly in `Meme's folder` appear on the main Memes page.
Selecting an image opens the original full-size file. No gallery list or code
changes are needed when adding, renaming, or removing folders.

Supported formats: JPG/JPEG, PNG, GIF (including animation), WebP, AVIF, and SVG.
Names with spaces, Unicode, and URL punctuation are supported. Hidden entries,
symlinks, and non-image files are omitted from the gallery. Everything in `public/`
is publicly served, so keep only material intended for publication there.
Empty folders need a `.gitkeep` file for Git to preserve them.

Restart the development server after changing the folder structure if new routes
do not appear. Run `npm run build` and redeploy to update the published galleries;
the website cannot read folders on your computer after deployment.

Run the folder discovery checks with `node --test tests/memes.test.js`.

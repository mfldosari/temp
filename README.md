# VEYLO — storefront preview

A dark, Arabic-first storefront for VEYLO (with an English switch), built as plain HTML, CSS and JavaScript. No build step.

**Live:** https://mfldosari.github.io/temp/

## What's here

| File | What it holds |
|---|---|
| `index.html` | Page structure: header, welcome banner, tagline, collection, payment banner, footer |
| `style.css` | The look: colours, type, layout |
| `app.js` | Products, Arabic/English copy, quick view, bag |
| `img/` | Brand banners (original files, never cropped) |
| `img/collection/` | One photo per piece (original files, never cropped) |

## Changing products

Everything about the pieces lives in `PRODUCTS` near the top of `app.js`. The collection currently has 6 pullovers (Cipher, Orbit and Dusk, two colours each) and 2 sweaters (Ember, two colours). Every colour is its own piece with its own photo.

- **Add a colour:** add an entry to that style's `colors` list and put its photo in `img/collection/`.
- **Add a style:** copy a whole style block, give it a new `id`, and set `category` to `pullovers` or `sweaters`.
- **Prices are placeholders.** Replace `price` on each style.

## Not connected yet

Checkout is a preview: the bag works, but the "Checkout" button only shows a notice. No payment is taken.

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

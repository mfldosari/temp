# VEYLO — storefront preview

A dark, Arabic-first storefront for VEYLO (with an English switch), built as plain HTML, CSS and JavaScript. No build step.

**Live:** https://mfldosari.github.io/temp/

## Pages

- **Home** (`/`): welcome and payment banners, the tagline, and the collection. Each category shows its banner and all its pieces.
- **Pullovers** (`#pullovers`) and **Sweaters** (`#sweaters`): a page per category, opened by the banner's "Discover" link or the header. The pullovers page has a filter by style.
- **Checkout**: opens from the bag (see below).

A VEYLO loader plays on a first visit (the wordmark assembles and the screen opens from the centre), and a short version on later visits, page changes and payment. Photos load over a shimmering skeleton.

## What's here

| File | What it holds |
|---|---|
| `index.html` | Page structure: header, welcome banner, tagline, collection, payment banner, footer |
| `style.css` | The look: colours, type, layout |
| `app.js` | Products, Arabic/English copy, pages, loader, skeletons, hero slideshow and light, quick view, bag |
| `checkout.js` | The demo checkout: delivery, shipping, payment, confirmation |
| `img/` | Brand banners (original files, never cropped) |
| `img/collection/` | One photo per piece (original files, never cropped) |

## Changing products

Everything about the pieces lives in `PRODUCTS` near the top of `app.js`. The collection currently has 6 pullovers (Cipher, Orbit and Dusk, two colours each) and 2 sweaters (Ember, two colours). Every colour is its own piece with its own photo.

- **Add a colour:** add an entry to that style's `colors` list and put its photo in `img/collection/`.
- **Add a style:** copy a whole style block, give it a new `id`, and set `category` to `pullovers` or `sweaters`.
- **Prices are placeholders.** Replace `price` on each style.

## Checkout (demo, end to end)

Bag → delivery details → shipping → payment → order confirmation. Nothing is charged and nothing typed is sent anywhere.

- **Card (mada, Visa, Mastercard):** only the demo cards work, then a simulated bank verification step. Use code `1234`.
  - `4242 4242 4242 4242`: succeeds
  - `5555 5555 5555 4444`: succeeds
  - `4000 0000 0000 0002`: is declined
  - Any future expiry date and any 3-digit security code.
- **Apple Pay, tabby, tamara:** simulated approval sheets. tabby and tamara use code `1234`.
- **Shipping fees and times are placeholders** (`SHIPPING` in `checkout.js`).

Connecting a real payment gateway means replacing the simulated steps in `checkout.js` with the provider's own checkout.

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

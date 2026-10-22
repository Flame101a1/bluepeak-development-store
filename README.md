# BluePeak Development storefront

A standalone HTML, CSS and JavaScript storefront for GitHub Pages. The existing BluePeak design and original artwork are retained. No framework, database, npm installation or production build is required.

## Site files

The working folder is the website source. Serve or publish index.html directly from this folder, alongside assets/, js/, config.js, 404.html, robots.txt and .nojekyll. No ZIP, staging step or build is needed.

The site files are prepared for upload. Before opening sales, complete the pending items in RELEASE_READINESS.md. The website has not been deployed from this workspace.

## Preview locally

Open a terminal in this folder and run:

    node scripts/serve.mjs

Open http://127.0.0.1:8080. A recent Node.js (22+) is sufficient; no dependencies are installed. A static development server such as VS Code Live Server also works. Do not use file:// URLs because JavaScript modules and browser API requests need an HTTP origin.

## Store settings

Edit js/config.js. This is the single source for the public Tebex token, branding paths, Discord, documentation, optional YouTube/support links, refresh interval, homepage section order, theme colors and approved policy copy. Root config.js is a compatibility import only.

The configured token is a Headless PUBLIC webstore token and is intentionally readable in the website source. Never put a private Checkout API key, webhook secret, password or payment information in browser files. There is no .env file for this site.

The original artwork is already installed unchanged:

- assets/brand/bluepeak-hero.png
- assets/brand/bluepeak-logo.png

Missing optional links are hidden. Discord is configured as the available support/community channel; additional support details were deferred by request.

## Automatic product updates

Latest Resources, categories, navigation and product details use the real Tebex catalog. The manual Featured Resources section and its product-ID list have been removed. Nothing needs to be edited on the website when a product is created, renamed, repriced or removed in Tebex.

Active pages refresh the catalog on a 60-second schedule. Hidden tabs pause polling and check for updates when reopened. Temporary failures retain the last successful catalog with an error message; request backoff respects API rate limits. Search, filtering, scroll position and keyboard focus are retained during refreshes. Product eligibility is checked again when adding to the basket.

## Publish to GitHub Pages

1. Use the site files directly from this working folder.
2. Upload those files to the publishing branch of your GitHub repository. index.html must be at the branch root, alongside assets/, js/, 404.html, robots.txt and .nojekyll.
3. In GitHub, open Settings → Pages.
4. Select Deploy from a branch, your publishing branch (usually main), and /(root).
5. Save, wait for deployment, and open the URL GitHub provides.
6. If using a custom domain, configure it in Pages settings, follow GitHub’s DNS instructions, and enable HTTPS.

Keep index.html at the publishing root. The release/, tests/ and scripts/ folders and internal reports are development files and are not required to serve the site.

The site automatically detects both a project URL such as https://username.github.io/repository/ and a custom-domain root. siteUrl may be set explicitly in js/config.js; include the repository path and trailing slash. If it is left blank, return URLs use the current served location.

After changing source files or configuration, refresh the preview; the server serves this working folder directly.

On Windows, run powershell -File scripts/package-release.ps1 to regenerate and verify the ZIP automatically. Alternatively, upload the staging folder’s contents directly. The release script produces a checksum manifest and records missing policy configuration. There are no framework build steps.

## Navigation and callbacks

GitHub Pages cannot rewrite arbitrary application paths. The storefront therefore uses fragment routes that survive reloads:

    #/resources
    #/category/actual-category-slug
    #/product/actual-package-ident
    #/basket
    #/auth/return
    #/checkout/complete
    #/checkout/cancel

Unknown application routes display a custom not-found view; unknown physical files use 404.html. Product metadata updates in the browser. Fragment routes have limited independent indexing and link-preview support on static hosts; this is not server-rendered product SEO.

## Basket, identity and checkout

Basket identifiers persist in localStorage for the current store token. No identity profile, payment information or card details are stored locally. Web Locks coordinate basket creation across supported tabs; an in-memory fallback keeps the page usable if storage is blocked. Every basket mutation retrieves the current basket and authoritative totals from Tebex. Completed and expired baskets stop being reused.

FiveM sign-in uses authentication options returned by the official basket endpoint. Users authenticate through Tebex/Cfx.re, never a BluePeak password form. The returning basket supplies verified identity information. Quantity controls respect package restrictions and Tebex eligibility checks.

Open Tebex checkout is the primary basket action, and Buy now uses the same hosted flow. Both refresh and validate the basket and check required authentication before following the official links.checkout URL supplied by Tebex. The optional embedded checkout helper retains dark mode and BluePeak colors.

A checkout return or browser payment event never verifies payment. Customers should use their Tebex receipt and payment records. Tebex retains responsibility for payments, billing, tax, fraud controls and configured fulfillment.

## Currency display

The top-right selector defaults to USD and offers USD, GBP, EUR, AUD, CAD and PLN. It remembers the visitor’s preference. Non-USD displays use Frankfurter reference rates, cached in memory for up to an hour and refreshed in active tabs. Converted values carry ≈ and the currency code; the original Tebex basket total is also shown.

Display selection does not enable a currency on the Tebex account or override checkout. The final payment currency and regional pricing follow the store’s Tebex settings. Invalid/unavailable rates keep the previous selection. Never send converted client prices to the payment API.

## Static-hosting limits

GitHub Pages cannot protect private API keys, process signed webhooks, set HttpOnly cookies, maintain an authoritative payment ledger or run custom fulfillment. Those optional features need a separate trusted service. None are implemented in browser code.

The public add-package contract supports the package identifier, quantity and dynamic flag. Option/variable metadata is displayed without inventing undocumented submission fields. Test any resource requiring additional pre-basket variables against its supported Tebex flow. Generating private dynamic packages or migrating tiers requires secure server-side credentials; viewing already-generated basket-scoped dynamic packages is supported.

The API currently reports the account name Emberis Solutions. Confirm or update that account’s buyer-facing branding in Tebex before launch. Its hosted-webstore disabled flag does not prevent the verified Headless operations and is not used to blanket-block browsing.

## Verification

    node --test tests/storefront.test.mjs tests/currency.test.mjs tests/integration.test.mjs

With the local server running, open http://127.0.0.1:8080/tests/browser.html for the isolated browser checks. Fixtures never load from the production index. The read-only live connectivity diagnostic is at /tests/connection.html.

The release pass verified 36 automated tests and 30 browser checks. Full details and remaining live checks are in INTEGRATION_TEST_REPORT.md and RELEASE_READINESS.md. No real purchases were made.

## Official references

- https://docs.tebex.io/developers/headless-api/endpoints
- https://github.com/tebexio/TebexHeadless-OpenAPI
- https://docs.tebex.io/developers/tebex.js/checkout
- https://docs.tebex.io/developers/tebex.js/checkout/events
- https://docs.tebex.io/creators/tebex-control-panel/settings/checkout/regional-pricing
- https://frankfurter.dev/

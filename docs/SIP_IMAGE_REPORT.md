# Sip N Scoop image update

Reviewed and mapped all 81 products before replacing assets. Installed 81 product images plus 81 smaller responsive variants. Sources are recorded individually in [the product map](sip-image-product-map.json). Compare every product visually in [the before/after gallery](SIP_IMAGE_REVIEW.html).

## What changed

- [Frontend/src/components/food/FoodCard.tsx](../Frontend/src/components/food/FoodCard.tsx): Sip-only square image stage, centered contain, responsive images, matching background, badge separation, smaller-screen padding and wrapping. Restaurant image presentation preserved.
- [Frontend/src/components/site/CartSheet.tsx](../Frontend/src/components/site/CartSheet.tsx): Resolve legacy Sip cart images and contain thumbnails without cropping.
- [Frontend/src/lib/catalog.tsx](../Frontend/src/lib/catalog.tsx): Remap only known legacy Sip image URLs received from the backend; preserve custom admin URLs.
- [Frontend/src/routes/sip-n-scoop.tsx](../Frontend/src/routes/sip-n-scoop.tsx): Stretch cards within each row, consistent responsive gaps and min-width protection.
- [backend/src/seed-data/products.json](../backend/src/seed-data/products.json): Update only 81 Sip image paths. Names, prices, descriptions, categories, availability, IDs/slugs and seed versions unchanged.
- Added a guarded image resolver and explicit asset whitelist for responsive srcsets. Unknown/custom URLs are not rewritten.
- Images are local WebP files with 960px square canvases and 480px alternatives, centered without stretching. Whitespace normalization preserves product packaging and flavour appearance. Source resolution is recorded: a 960px canvas does not imply additional photographic detail.

## Source limitations and confirmations

- Lemon Jeera uses Lahori Zeera, as you confirmed.
- Butter Scotch Cookie and Italian Cassata retain their existing Brick names but show the cake products you confirmed.
- Choco Block Brownie uses Havmor's Choco Block photo, cross-matched to the retailer's exact Choco Block Brownie listing. This establishes the catalog mapping, not independent verification of your current stock packaging.
- Rajwadi Kulfi Falooda Jumbo Cup has an exact 110ml-cup image, but its 417px cricket-background source limits the premium appearance. A clean supplier packshot would improve it further.
- Dark Chocolate Zero Sugar Jumbo Cup uses the manufacturer's zero-added-sugar cup photo with the campaign headline cropped away; its pink background remains. Kashmiri Kesar Kulfi also retains a pink promotional background.
- Independence 750ml uses a matching retailer listing; its 447px source limits label sharpness.
- Same-flavour vanilla cup portion variants share a manufacturer photo; different flavours never share a generic image. Package quantities explicitly named on cards remain unchanged.

## Validation

- TypeScript: npx tsc --noEmit passed.
- Final production build: npm run build passed. Existing build-plugin notices remain.
- All 162 WebP files decode and match their declared 480/960 dimensions.
- Browser checks at 1440, 768, 390 and 320px: all 81 images load, object-fit is contain, no page horizontal overflow, no uncaught page errors. Cards align within each grid row.
- Search, Cold Drinks category filter, add/increase/decrease quantity, cart image, legacy saved-cart image migration and product dialog verified.
- Seed comparison proved every non-image field and every restaurant product image unchanged.
- Browser checks used real seed data through mocked public API responses. No production database migration, order placement or deployment was performed. The legacy URL resolver lets an existing database use the new images without reseeding.

## Product Name | Old Image | New Image/Asset | Reason for Replacement

| Product Name | Old Image | New Image/Asset | Reason for Replacement |
| --- | --- | --- | --- |
| Havmor Choco Block Brownie Cone | [/sip-n-scoop/v9/cone-choco-block-brownie.webp](../Frontend/public/sip-n-scoop/v9/cone-choco-block-brownie.webp) | [/sip-n-scoop/premium/cone-choco-block-brownie.webp](../Frontend/public/sip-n-scoop/premium/cone-choco-block-brownie.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Belgian Silky Chocolate Cone | [/sip-n-scoop/v9/cone-belgian-silky-chocolate.webp](../Frontend/public/sip-n-scoop/v9/cone-belgian-silky-chocolate.webp) | [/sip-n-scoop/premium/cone-belgian-silky-chocolate.webp](../Frontend/public/sip-n-scoop/premium/cone-belgian-silky-chocolate.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Cookie N Cream Cone | [/sip-n-scoop/v9/cone-cookie-n-cream.webp](../Frontend/public/sip-n-scoop/v9/cone-cookie-n-cream.webp) | [/sip-n-scoop/premium/cone-cookie-n-cream.webp](../Frontend/public/sip-n-scoop/premium/cone-cookie-n-cream.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Dark Chocolate Cone | [/sip-n-scoop/v9/cone-dark-chocolate.webp](../Frontend/public/sip-n-scoop/v9/cone-dark-chocolate.webp) | [/sip-n-scoop/premium/cone-dark-chocolate.webp](../Frontend/public/sip-n-scoop/premium/cone-dark-chocolate.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Kesar Pista Cone | [/sip-n-scoop/v9/cone-kesar-pista.webp](../Frontend/public/sip-n-scoop/v9/cone-kesar-pista.webp) | [/sip-n-scoop/premium/cone-kesar-pista.webp](../Frontend/public/sip-n-scoop/premium/cone-kesar-pista.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Choco Brownie Cone | [/sip-n-scoop/v9/cone-choco-brownie.webp](../Frontend/public/sip-n-scoop/v9/cone-choco-brownie.webp) | [/sip-n-scoop/premium/cone-choco-brownie.webp](../Frontend/public/sip-n-scoop/premium/cone-choco-brownie.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Chocolate Cone | [/sip-n-scoop/v9/cone-chocolate.webp](../Frontend/public/sip-n-scoop/v9/cone-chocolate.webp) | [/sip-n-scoop/premium/cone-chocolate.webp](../Frontend/public/sip-n-scoop/premium/cone-chocolate.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Yummy Strawberry Cone | [/sip-n-scoop/v9/cone-yummy-strawberry.webp](../Frontend/public/sip-n-scoop/v9/cone-yummy-strawberry.webp) | [/sip-n-scoop/premium/cone-yummy-strawberry.webp](../Frontend/public/sip-n-scoop/premium/cone-yummy-strawberry.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Butter Scotch Cone | [/sip-n-scoop/v9/cone-butter-scotch.webp](../Frontend/public/sip-n-scoop/v9/cone-butter-scotch.webp) | [/sip-n-scoop/premium/cone-butter-scotch.webp](../Frontend/public/sip-n-scoop/premium/cone-butter-scotch.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Chic Chocolate Cone | [/sip-n-scoop/v9/cone-chic-chocolate.webp](../Frontend/public/sip-n-scoop/v9/cone-chic-chocolate.webp) | [/sip-n-scoop/premium/cone-chic-chocolate.webp](../Frontend/public/sip-n-scoop/premium/cone-chic-chocolate.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Choco Vanilla Cone | [/sip-n-scoop/v9/cone-choco-vanilla.webp](../Frontend/public/sip-n-scoop/v9/cone-choco-vanilla.webp) | [/sip-n-scoop/premium/cone-choco-vanilla.webp](../Frontend/public/sip-n-scoop/premium/cone-choco-vanilla.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Butterscotch 80 ml | [/sip-n-scoop/v9/cone-havmor-butter-scotch.webp](../Frontend/public/sip-n-scoop/v9/cone-havmor-butter-scotch.webp) | [/sip-n-scoop/premium/cone-havmor-butter-scotch.webp](../Frontend/public/sip-n-scoop/premium/cone-havmor-butter-scotch.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Butterscotch | [/sip-n-scoop/v9/cone-magic-butter-scotch.webp](../Frontend/public/sip-n-scoop/v9/cone-magic-butter-scotch.webp) | [/sip-n-scoop/premium/cone-magic-butter-scotch.webp](../Frontend/public/sip-n-scoop/premium/cone-magic-butter-scotch.webp) | Replaced green/unclear cone image with an unwrapped butterscotch cone; avoids an incorrect pack-size label. |
| Havmor Jumbo Crunchy Chocobar | [/sip-n-scoop/v9/bar-jumbo-crunchy-chocobar.webp](../Frontend/public/sip-n-scoop/v9/bar-jumbo-crunchy-chocobar.webp) | [/sip-n-scoop/premium/bar-jumbo-crunchy-chocobar.webp](../Frontend/public/sip-n-scoop/premium/bar-jumbo-crunchy-chocobar.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Jumbo Classic Chocobar | [/sip-n-scoop/v9/bar-jumbo-classic-chocobar.webp](../Frontend/public/sip-n-scoop/v9/bar-jumbo-classic-chocobar.webp) | [/sip-n-scoop/premium/bar-jumbo-classic-chocobar.webp](../Frontend/public/sip-n-scoop/premium/bar-jumbo-classic-chocobar.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Zulubar Dark Crunch | [/sip-n-scoop/v9/bar-zulubar-dark-crunch.webp](../Frontend/public/sip-n-scoop/v9/bar-zulubar-dark-crunch.webp) | [/sip-n-scoop/premium/bar-zulubar-dark-crunch.webp](../Frontend/public/sip-n-scoop/premium/bar-zulubar-dark-crunch.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Zulubar | [/sip-n-scoop/v9/bar-zulubar.webp](../Frontend/public/sip-n-scoop/v9/bar-zulubar.webp) | [/sip-n-scoop/premium/bar-zulubar.webp](../Frontend/public/sip-n-scoop/premium/bar-zulubar.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Jumbo Mango Dolly | [/sip-n-scoop/v9/dolly-jumbo-mango-dolly.webp](../Frontend/public/sip-n-scoop/v9/dolly-jumbo-mango-dolly.webp) | [/sip-n-scoop/premium/dolly-jumbo-mango-dolly.webp](../Frontend/public/sip-n-scoop/premium/dolly-jumbo-mango-dolly.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Jumbo Raspberry Dolly | [/sip-n-scoop/v9/dolly-jumbo-raspberry-dolly.webp](../Frontend/public/sip-n-scoop/v9/dolly-jumbo-raspberry-dolly.webp) | [/sip-n-scoop/premium/dolly-jumbo-raspberry-dolly.webp](../Frontend/public/sip-n-scoop/premium/dolly-jumbo-raspberry-dolly.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Aam Fruit Candy | [/sip-n-scoop/v9/fruit-aam.webp](../Frontend/public/sip-n-scoop/v9/fruit-aam.webp) | [/sip-n-scoop/premium/fruit-aam.webp](../Frontend/public/sip-n-scoop/premium/fruit-aam.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Kachcha Aam Ice Candy | [/sip-n-scoop/v9/ice-kachcha-aam.webp](../Frontend/public/sip-n-scoop/v9/ice-kachcha-aam.webp) | [/sip-n-scoop/premium/ice-kachcha-aam.webp](../Frontend/public/sip-n-scoop/premium/ice-kachcha-aam.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Orange Bar Ice Candy | [/sip-n-scoop/v9/ice-orange-bar.webp](../Frontend/public/sip-n-scoop/v9/ice-orange-bar.webp) | [/sip-n-scoop/premium/ice-orange-bar.webp](../Frontend/public/sip-n-scoop/premium/ice-orange-bar.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Butter Scotch Cup | [/sip-n-scoop/v9/cup-butter-scotch.webp](../Frontend/public/sip-n-scoop/v9/cup-butter-scotch.webp) | [/sip-n-scoop/premium/cup-butter-scotch.webp](../Frontend/public/sip-n-scoop/premium/cup-butter-scotch.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Vanilla Cup | [/sip-n-scoop/v9/cup-vanilla-85.webp](../Frontend/public/sip-n-scoop/v9/cup-vanilla-85.webp) | [/sip-n-scoop/premium/cup-vanilla-85.webp](../Frontend/public/sip-n-scoop/premium/cup-vanilla-85.webp) | Removed incorrectly blue ice cream; now white vanilla in a cup. |
| Havmor Vanilla Mini Cup | [/sip-n-scoop/v9/cup-vanilla-50.webp](../Frontend/public/sip-n-scoop/v9/cup-vanilla-50.webp) | [/sip-n-scoop/premium/cup-vanilla-50.webp](../Frontend/public/sip-n-scoop/premium/cup-vanilla-50.webp) | Replaced the wrong-size cup presentation with a compact vanilla cup; same flavour as Vanilla Cup. |
| Havmor Strawberry Mini Cup | [/sip-n-scoop/v9/cup-strawberry.webp](../Frontend/public/sip-n-scoop/v9/cup-strawberry.webp) | [/sip-n-scoop/premium/cup-strawberry.webp](../Frontend/public/sip-n-scoop/premium/cup-strawberry.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Tutti Frutti Mini Cup | [/sip-n-scoop/v9/cup-tutti-frutti.webp](../Frontend/public/sip-n-scoop/v9/cup-tutti-frutti.webp) | [/sip-n-scoop/premium/cup-tutti-frutti.webp](../Frontend/public/sip-n-scoop/premium/cup-tutti-frutti.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Choco Brownie Sundae Cup | [/sip-n-scoop/v9/sundae-choco-brownie.webp](../Frontend/public/sip-n-scoop/v9/sundae-choco-brownie.webp) | [/sip-n-scoop/premium/sundae-choco-brownie.webp](../Frontend/public/sip-n-scoop/premium/sundae-choco-brownie.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Choco Sundae Cup | [/sip-n-scoop/v9/sundae-choco.webp](../Frontend/public/sip-n-scoop/v9/sundae-choco.webp) | [/sip-n-scoop/premium/sundae-choco.webp](../Frontend/public/sip-n-scoop/premium/sundae-choco.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Strawberry Sundae Cup | [/sip-n-scoop/v9/sundae-strawberry.webp](../Frontend/public/sip-n-scoop/v9/sundae-strawberry.webp) | [/sip-n-scoop/premium/sundae-strawberry.webp](../Frontend/public/sip-n-scoop/premium/sundae-strawberry.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Nutty Belgian Dark Chocolate Jumbo Cup | [/sip-n-scoop/v9/jumbo-nutty-belgian-dark-chocolate.webp](../Frontend/public/sip-n-scoop/v9/jumbo-nutty-belgian-dark-chocolate.webp) | [/sip-n-scoop/premium/jumbo-nutty-belgian-dark-chocolate.webp](../Frontend/public/sip-n-scoop/premium/jumbo-nutty-belgian-dark-chocolate.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Rajbhog Jumbo Cup | [/sip-n-scoop/v9/jumbo-rajbhog.webp](../Frontend/public/sip-n-scoop/v9/jumbo-rajbhog.webp) | [/sip-n-scoop/premium/jumbo-rajbhog.webp](../Frontend/public/sip-n-scoop/premium/jumbo-rajbhog.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Rajwadi Kulfi Falooda Jumbo Cup | [/sip-n-scoop/v9/jumbo-rajwadi-kulfi-falooda.webp](../Frontend/public/sip-n-scoop/v9/jumbo-rajwadi-kulfi-falooda.webp) | [/sip-n-scoop/premium/jumbo-rajwadi-kulfi-falooda.webp](../Frontend/public/sip-n-scoop/premium/jumbo-rajwadi-kulfi-falooda.webp) | Correct 110ml Rajwadi Kulfi Falooda cup; rejected sources depicting the family tub or a kulfi stick. |
| Havmor Kesar Pista Jumbo Cup | [/sip-n-scoop/v9/jumbo-kesar-pista.webp](../Frontend/public/sip-n-scoop/v9/jumbo-kesar-pista.webp) | [/sip-n-scoop/premium/jumbo-kesar-pista.webp](../Frontend/public/sip-n-scoop/premium/jumbo-kesar-pista.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Chocolate Chips Jumbo Cup | [/sip-n-scoop/v9/jumbo-chocolate-chips.webp](../Frontend/public/sip-n-scoop/v9/jumbo-chocolate-chips.webp) | [/sip-n-scoop/premium/jumbo-chocolate-chips.webp](../Frontend/public/sip-n-scoop/premium/jumbo-chocolate-chips.webp) | Removed purple ice cream; now chocolate ice cream/chips in the correct jumbo cup. |
| Havmor Premium Kaju Kishmish Jumbo Cup | [/sip-n-scoop/v9/jumbo-premium-kaju-kishmish.webp](../Frontend/public/sip-n-scoop/v9/jumbo-premium-kaju-kishmish.webp) | [/sip-n-scoop/premium/jumbo-premium-kaju-kishmish.webp](../Frontend/public/sip-n-scoop/premium/jumbo-premium-kaju-kishmish.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor American Nuts Jumbo Cup | [/sip-n-scoop/v9/jumbo-american-nuts.webp](../Frontend/public/sip-n-scoop/v9/jumbo-american-nuts.webp) | [/sip-n-scoop/premium/jumbo-american-nuts.webp](../Frontend/public/sip-n-scoop/premium/jumbo-american-nuts.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Vanilla Jumbo Cup | [/sip-n-scoop/v9/jumbo-vanilla.webp](../Frontend/public/sip-n-scoop/v9/jumbo-vanilla.webp) | [/sip-n-scoop/premium/jumbo-vanilla.webp](../Frontend/public/sip-n-scoop/premium/jumbo-vanilla.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Dark Chocolate Zero Sugar Jumbo Cup | [/sip-n-scoop/v9/jumbo-dark-chocolate-zero-sugar.webp](../Frontend/public/sip-n-scoop/v9/jumbo-dark-chocolate-zero-sugar.webp) | [/sip-n-scoop/premium/jumbo-dark-chocolate-zero-sugar.webp](../Frontend/public/sip-n-scoop/premium/jumbo-dark-chocolate-zero-sugar.webp) | Correct Dark Chocolate Zero Added Sugar cup from the manufacturer campaign; cropped away the headline. |
| Havmor Kesar Pista Zero Sugar Jumbo Cup | [/sip-n-scoop/v9/jumbo-kesar-pista-zero-sugar.webp](../Frontend/public/sip-n-scoop/v9/jumbo-kesar-pista-zero-sugar.webp) | [/sip-n-scoop/premium/jumbo-kesar-pista-zero-sugar.webp](../Frontend/public/sip-n-scoop/premium/jumbo-kesar-pista-zero-sugar.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Vanilla Zero Sugar Jumbo Cup | [/sip-n-scoop/v9/jumbo-vanilla-zero-sugar.webp](../Frontend/public/sip-n-scoop/v9/jumbo-vanilla-zero-sugar.webp) | [/sip-n-scoop/premium/jumbo-vanilla-zero-sugar.webp](../Frontend/public/sip-n-scoop/premium/jumbo-vanilla-zero-sugar.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Matka Kulfi | [/sip-n-scoop/v9/kulfi-matka.webp](../Frontend/public/sip-n-scoop/v9/kulfi-matka.webp) | [/sip-n-scoop/premium/kulfi-matka.webp](../Frontend/public/sip-n-scoop/premium/kulfi-matka.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Kashmiri Kesar Kulfi | [/sip-n-scoop/v9/kulfi-kashmiri-kesar.webp](../Frontend/public/sip-n-scoop/v9/kulfi-kashmiri-kesar.webp) | [/sip-n-scoop/premium/kulfi-kashmiri-kesar.webp](../Frontend/public/sip-n-scoop/premium/kulfi-kashmiri-kesar.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Chowpaty Kulfi | [/sip-n-scoop/v9/kulfi-chowpaty.webp](../Frontend/public/sip-n-scoop/v9/kulfi-chowpaty.webp) | [/sip-n-scoop/premium/kulfi-chowpaty.webp](../Frontend/public/sip-n-scoop/premium/kulfi-chowpaty.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Dryfruit Rabdi Kulfi | [/sip-n-scoop/v9/kulfi-dryfruit-rabdi.webp](../Frontend/public/sip-n-scoop/v9/kulfi-dryfruit-rabdi.webp) | [/sip-n-scoop/premium/kulfi-dryfruit-rabdi.webp](../Frontend/public/sip-n-scoop/premium/kulfi-dryfruit-rabdi.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Raj Bhog Kulfi | [/sip-n-scoop/v9/kulfi-raj-bhog.webp](../Frontend/public/sip-n-scoop/v9/kulfi-raj-bhog.webp) | [/sip-n-scoop/premium/kulfi-raj-bhog.webp](../Frontend/public/sip-n-scoop/premium/kulfi-raj-bhog.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Mava Tillewali Kulfi | [/sip-n-scoop/v9/kulfi-mava-tillewali.webp](../Frontend/public/sip-n-scoop/v9/kulfi-mava-tillewali.webp) | [/sip-n-scoop/premium/kulfi-mava-tillewali.webp](../Frontend/public/sip-n-scoop/premium/kulfi-mava-tillewali.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Shahi Kulfi | [/sip-n-scoop/v9/kulfi-shahi.webp](../Frontend/public/sip-n-scoop/v9/kulfi-shahi.webp) | [/sip-n-scoop/premium/kulfi-shahi.webp](../Frontend/public/sip-n-scoop/premium/kulfi-shahi.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Bombay Kulfi | [/sip-n-scoop/v9/kulfi-bombay.webp](../Frontend/public/sip-n-scoop/v9/kulfi-bombay.webp) | [/sip-n-scoop/premium/kulfi-bombay.webp](../Frontend/public/sip-n-scoop/premium/kulfi-bombay.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Rajwadi Kulfi | [/sip-n-scoop/v9/kulfi-rajwadi.webp](../Frontend/public/sip-n-scoop/v9/kulfi-rajwadi.webp) | [/sip-n-scoop/premium/kulfi-rajwadi.webp](../Frontend/public/sip-n-scoop/premium/kulfi-rajwadi.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Mava Malai Kulfi | [/sip-n-scoop/v9/kulfi-mava-malai.webp](../Frontend/public/sip-n-scoop/v9/kulfi-mava-malai.webp) | [/sip-n-scoop/premium/kulfi-mava-malai.webp](../Frontend/public/sip-n-scoop/premium/kulfi-mava-malai.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor SF Malai Kulfi | [/sip-n-scoop/v9/kulfi-sf-malai.webp](../Frontend/public/sip-n-scoop/v9/kulfi-sf-malai.webp) | [/sip-n-scoop/premium/kulfi-sf-malai.webp](../Frontend/public/sip-n-scoop/premium/kulfi-sf-malai.webp) | Replaced blurry/cut-off or mismatched imagery with the named Havmor flavour and serving format. |
| Havmor Rajbhog Brick Combo | [/sip-n-scoop/v9/brick-rajbhog.webp](../Frontend/public/sip-n-scoop/v9/brick-rajbhog.webp) | [/sip-n-scoop/premium/brick-rajbhog.webp](../Frontend/public/sip-n-scoop/premium/brick-rajbhog.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Kesar Pista Brick Combo | [/sip-n-scoop/v9/brick-kesar-pista.webp](../Frontend/public/sip-n-scoop/v9/brick-kesar-pista.webp) | [/sip-n-scoop/premium/brick-kesar-pista.webp](../Frontend/public/sip-n-scoop/premium/brick-kesar-pista.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor American Nuts Brick Combo | [/sip-n-scoop/v9/brick-american-nuts.webp](../Frontend/public/sip-n-scoop/v9/brick-american-nuts.webp) | [/sip-n-scoop/premium/brick-american-nuts.webp](../Frontend/public/sip-n-scoop/premium/brick-american-nuts.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Almond Carnival Brick Combo | [/sip-n-scoop/v9/brick-almond-carnival.webp](../Frontend/public/sip-n-scoop/v9/brick-almond-carnival.webp) | [/sip-n-scoop/premium/brick-almond-carnival.webp](../Frontend/public/sip-n-scoop/premium/brick-almond-carnival.webp) | Removed pink/mismatched artwork; now Almond Carnival family-pack boxes. |
| Havmor Choco Brownie Brick Combo | [/sip-n-scoop/v9/brick-choco-brownie.webp](../Frontend/public/sip-n-scoop/v9/brick-choco-brownie.webp) | [/sip-n-scoop/premium/brick-choco-brownie.webp](../Frontend/public/sip-n-scoop/premium/brick-choco-brownie.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Chocolate Chips Brick Combo | [/sip-n-scoop/v9/brick-chocolate-chips.webp](../Frontend/public/sip-n-scoop/v9/brick-chocolate-chips.webp) | [/sip-n-scoop/premium/brick-chocolate-chips.webp](../Frontend/public/sip-n-scoop/premium/brick-chocolate-chips.webp) | Removed purple/mismatched artwork; now Chocolate Chips family-pack boxes. |
| Havmor Kaju Draksh Brick Combo | [/sip-n-scoop/v9/brick-kaju-draksh.webp](../Frontend/public/sip-n-scoop/v9/brick-kaju-draksh.webp) | [/sip-n-scoop/premium/brick-kaju-draksh.webp](../Frontend/public/sip-n-scoop/premium/brick-kaju-draksh.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Alphonso Mango Brick Combo | [/sip-n-scoop/v9/brick-alphonso-mango.webp](../Frontend/public/sip-n-scoop/v9/brick-alphonso-mango.webp) | [/sip-n-scoop/premium/brick-alphonso-mango.webp](../Frontend/public/sip-n-scoop/premium/brick-alphonso-mango.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Cookie Cream Brick Combo | [/sip-n-scoop/v9/brick-cookie-cream.webp](../Frontend/public/sip-n-scoop/v9/brick-cookie-cream.webp) | [/sip-n-scoop/premium/brick-cookie-cream.webp](../Frontend/public/sip-n-scoop/premium/brick-cookie-cream.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Black Currant Brick Combo | [/sip-n-scoop/v9/brick-black-currant.webp](../Frontend/public/sip-n-scoop/v9/brick-black-currant.webp) | [/sip-n-scoop/premium/brick-black-currant.webp](../Frontend/public/sip-n-scoop/premium/brick-black-currant.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Tutti Frutti Brick Combo | [/sip-n-scoop/v9/brick-tutti-frutti.webp](../Frontend/public/sip-n-scoop/v9/brick-tutti-frutti.webp) | [/sip-n-scoop/premium/brick-tutti-frutti.webp](../Frontend/public/sip-n-scoop/premium/brick-tutti-frutti.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Crunchy Butter Scotch Brick Combo | [/sip-n-scoop/v9/brick-crunchy-butter-scotch.webp](../Frontend/public/sip-n-scoop/v9/brick-crunchy-butter-scotch.webp) | [/sip-n-scoop/premium/brick-crunchy-butter-scotch.webp](../Frontend/public/sip-n-scoop/premium/brick-crunchy-butter-scotch.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Strawberry Brick Combo | [/sip-n-scoop/v9/brick-strawberry.webp](../Frontend/public/sip-n-scoop/v9/brick-strawberry.webp) | [/sip-n-scoop/premium/brick-strawberry.webp](../Frontend/public/sip-n-scoop/premium/brick-strawberry.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Vanilla Brick Combo | [/sip-n-scoop/v9/brick-vanilla.webp](../Frontend/public/sip-n-scoop/v9/brick-vanilla.webp) | [/sip-n-scoop/premium/brick-vanilla.webp](../Frontend/public/sip-n-scoop/premium/brick-vanilla.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Taj Mahal Brick | [/sip-n-scoop/v9/brick-taj-mahal.webp](../Frontend/public/sip-n-scoop/v9/brick-taj-mahal.webp) | [/sip-n-scoop/premium/brick-taj-mahal.webp](../Frontend/public/sip-n-scoop/premium/brick-taj-mahal.webp) | Replaced blurry/mismatched family-pack artwork with the named Havmor flavour packaging. |
| Havmor Butter Scotch Cookie Brick | [/sip-n-scoop/v9/brick-butterscotch-cookie.webp](../Frontend/public/sip-n-scoop/v9/brick-butterscotch-cookie.webp) | [/sip-n-scoop/premium/brick-butterscotch-cookie.webp](../Frontend/public/sip-n-scoop/premium/brick-butterscotch-cookie.webp) | Now the actual Butterscotch Cookie ice-cream cake packaging, confirmed by the user; card name preserved. |
| Havmor Italian Cassata Brick | [/sip-n-scoop/v9/brick-italian-cassata.webp](../Frontend/public/sip-n-scoop/v9/brick-italian-cassata.webp) | [/sip-n-scoop/premium/brick-italian-cassata.webp](../Frontend/public/sip-n-scoop/premium/brick-italian-cassata.webp) | Now the actual Italian Cassata ice-cream cake packaging, confirmed by the user; card name preserved. |
| Independence Water 750 ml | [/sip-n-scoop/v9/independence-water-750.webp](../Frontend/public/sip-n-scoop/v9/independence-water-750.webp) | [/sip-n-scoop/premium/independence-water-750.webp](../Frontend/public/sip-n-scoop/premium/independence-water-750.webp) | Replaced busy water artwork with a retailer-listed Independence 750ml bottle. |
| Bisleri Water 1 L | [/sip-n-scoop/v9/bisleri-1l.webp](../Frontend/public/sip-n-scoop/v9/bisleri-1l.webp) | [/sip-n-scoop/premium/bisleri-1l.webp](../Frontend/public/sip-n-scoop/premium/bisleri-1l.webp) | Replaced generic, busy or low-detail image with the named beverage in its bottle/carton format. |
| Sprite 1 L | [/sip-n-scoop/v9/sprite-1l.webp](../Frontend/public/sip-n-scoop/v9/sprite-1l.webp) | [/sip-n-scoop/premium/sprite-1l.webp](../Frontend/public/sip-n-scoop/premium/sprite-1l.webp) | Replaced promotional layout with a centered Sprite 1L bottle; removed side advertising panel. |
| Coca-Cola 1 L | [/sip-n-scoop/v9/coca-cola-1l.webp](../Frontend/public/sip-n-scoop/v9/coca-cola-1l.webp) | [/sip-n-scoop/premium/coca-cola-1l.webp](../Frontend/public/sip-n-scoop/premium/coca-cola-1l.webp) | Replaced generic, busy or low-detail image with the named beverage in its bottle/carton format. |
| Thums Up 1 L | [/sip-n-scoop/v9/thums-up-1l.webp](../Frontend/public/sip-n-scoop/v9/thums-up-1l.webp) | [/sip-n-scoop/premium/thums-up-1l.webp](../Frontend/public/sip-n-scoop/premium/thums-up-1l.webp) | Replaced generic, busy or low-detail image with the named beverage in its bottle/carton format. |
| Thums Up XForce | [/sip-n-scoop/v9/thums-up-xforce-10.webp](../Frontend/public/sip-n-scoop/v9/thums-up-xforce-10.webp) | [/sip-n-scoop/premium/thums-up-xforce-10.webp](../Frontend/public/sip-n-scoop/premium/thums-up-xforce-10.webp) | Replaced generic, busy or low-detail image with the named beverage in its bottle/carton format. |
| Campa Orange | [/sip-n-scoop/v9/campa-orange-10.webp](../Frontend/public/sip-n-scoop/v9/campa-orange-10.webp) | [/sip-n-scoop/premium/campa-orange-10.webp](../Frontend/public/sip-n-scoop/premium/campa-orange-10.webp) | Replaced generic, busy or low-detail image with the named beverage in its bottle/carton format. |
| Campa Cola | [/sip-n-scoop/v9/campa-cola-10.webp](../Frontend/public/sip-n-scoop/v9/campa-cola-10.webp) | [/sip-n-scoop/premium/campa-cola-10.webp](../Frontend/public/sip-n-scoop/premium/campa-cola-10.webp) | Replaced generic, busy or low-detail image with the named beverage in its bottle/carton format. |
| RasKik Nimbu Paani | [/sip-n-scoop/v9/raskik-nimbu-paani-10.webp](../Frontend/public/sip-n-scoop/v9/raskik-nimbu-paani-10.webp) | [/sip-n-scoop/premium/raskik-nimbu-paani-10.webp](../Frontend/public/sip-n-scoop/premium/raskik-nimbu-paani-10.webp) | Replaced generic, busy or low-detail image with the named beverage in its bottle/carton format. |
| Coke Zero | [/sip-n-scoop/sip-coke-zero-10.svg](../Frontend/public/sip-n-scoop/sip-coke-zero-10.svg) | [/sip-n-scoop/premium/sip-coke-zero-10.webp](../Frontend/public/sip-n-scoop/premium/sip-coke-zero-10.webp) | Replaced generic cola SVG with Coca-Cola Zero Sugar bottle photography. |
| Lemon Jeera | [/sip-n-scoop/sip-lemon-jeera-10.svg](../Frontend/public/sip-n-scoop/sip-lemon-jeera-10.svg) | [/sip-n-scoop/premium/sip-lemon-jeera-10.webp](../Frontend/public/sip-n-scoop/premium/sip-lemon-jeera-10.webp) | Replaced generic cola SVG with official Lahori Zeera bottle, as confirmed by the user. |
| Frooti | [/sip-n-scoop/sip-frooti-10.svg](../Frontend/public/sip-n-scoop/sip-frooti-10.svg) | [/sip-n-scoop/premium/sip-frooti-10.webp](../Frontend/public/sip-n-scoop/premium/sip-frooti-10.webp) | Replaced generic carton SVG with the Frooti mango tetra pack; removed side advertising panel. |

## Every modified source file

- Frontend/src/components/food/FoodCard.tsx
- Frontend/src/components/site/CartSheet.tsx
- Frontend/src/lib/catalog.tsx
- Frontend/src/routes/sip-n-scoop.tsx
- backend/src/seed-data/products.json

## Every added source, documentation and asset file

- Frontend/src/lib/sip-images.ts
- docs/sip-image-inventory.json
- docs/sip-image-product-map.json
- docs/SIP_IMAGE_REPORT.md
- docs/SIP_IMAGE_REVIEW.html
- docs/sip-image-review/browser-results.json
- docs/sip-image-review/viewport-1440.png
- docs/sip-image-review/viewport-768.png
- docs/sip-image-review/viewport-390.png
- docs/sip-image-review/viewport-320.png
- Frontend/public/sip-n-scoop/premium/cone-choco-block-brownie.webp
- Frontend/public/sip-n-scoop/premium/cone-choco-block-brownie-480.webp
- Frontend/public/sip-n-scoop/premium/cone-belgian-silky-chocolate.webp
- Frontend/public/sip-n-scoop/premium/cone-belgian-silky-chocolate-480.webp
- Frontend/public/sip-n-scoop/premium/cone-cookie-n-cream.webp
- Frontend/public/sip-n-scoop/premium/cone-cookie-n-cream-480.webp
- Frontend/public/sip-n-scoop/premium/cone-dark-chocolate.webp
- Frontend/public/sip-n-scoop/premium/cone-dark-chocolate-480.webp
- Frontend/public/sip-n-scoop/premium/cone-kesar-pista.webp
- Frontend/public/sip-n-scoop/premium/cone-kesar-pista-480.webp
- Frontend/public/sip-n-scoop/premium/cone-choco-brownie.webp
- Frontend/public/sip-n-scoop/premium/cone-choco-brownie-480.webp
- Frontend/public/sip-n-scoop/premium/cone-chocolate.webp
- Frontend/public/sip-n-scoop/premium/cone-chocolate-480.webp
- Frontend/public/sip-n-scoop/premium/cone-yummy-strawberry.webp
- Frontend/public/sip-n-scoop/premium/cone-yummy-strawberry-480.webp
- Frontend/public/sip-n-scoop/premium/cone-butter-scotch.webp
- Frontend/public/sip-n-scoop/premium/cone-butter-scotch-480.webp
- Frontend/public/sip-n-scoop/premium/cone-chic-chocolate.webp
- Frontend/public/sip-n-scoop/premium/cone-chic-chocolate-480.webp
- Frontend/public/sip-n-scoop/premium/cone-choco-vanilla.webp
- Frontend/public/sip-n-scoop/premium/cone-choco-vanilla-480.webp
- Frontend/public/sip-n-scoop/premium/cone-havmor-butter-scotch.webp
- Frontend/public/sip-n-scoop/premium/cone-havmor-butter-scotch-480.webp
- Frontend/public/sip-n-scoop/premium/cone-magic-butter-scotch.webp
- Frontend/public/sip-n-scoop/premium/cone-magic-butter-scotch-480.webp
- Frontend/public/sip-n-scoop/premium/bar-jumbo-crunchy-chocobar.webp
- Frontend/public/sip-n-scoop/premium/bar-jumbo-crunchy-chocobar-480.webp
- Frontend/public/sip-n-scoop/premium/bar-jumbo-classic-chocobar.webp
- Frontend/public/sip-n-scoop/premium/bar-jumbo-classic-chocobar-480.webp
- Frontend/public/sip-n-scoop/premium/bar-zulubar-dark-crunch.webp
- Frontend/public/sip-n-scoop/premium/bar-zulubar-dark-crunch-480.webp
- Frontend/public/sip-n-scoop/premium/bar-zulubar.webp
- Frontend/public/sip-n-scoop/premium/bar-zulubar-480.webp
- Frontend/public/sip-n-scoop/premium/dolly-jumbo-mango-dolly.webp
- Frontend/public/sip-n-scoop/premium/dolly-jumbo-mango-dolly-480.webp
- Frontend/public/sip-n-scoop/premium/dolly-jumbo-raspberry-dolly.webp
- Frontend/public/sip-n-scoop/premium/dolly-jumbo-raspberry-dolly-480.webp
- Frontend/public/sip-n-scoop/premium/fruit-aam.webp
- Frontend/public/sip-n-scoop/premium/fruit-aam-480.webp
- Frontend/public/sip-n-scoop/premium/ice-kachcha-aam.webp
- Frontend/public/sip-n-scoop/premium/ice-kachcha-aam-480.webp
- Frontend/public/sip-n-scoop/premium/ice-orange-bar.webp
- Frontend/public/sip-n-scoop/premium/ice-orange-bar-480.webp
- Frontend/public/sip-n-scoop/premium/cup-butter-scotch.webp
- Frontend/public/sip-n-scoop/premium/cup-butter-scotch-480.webp
- Frontend/public/sip-n-scoop/premium/cup-vanilla-85.webp
- Frontend/public/sip-n-scoop/premium/cup-vanilla-85-480.webp
- Frontend/public/sip-n-scoop/premium/cup-vanilla-50.webp
- Frontend/public/sip-n-scoop/premium/cup-vanilla-50-480.webp
- Frontend/public/sip-n-scoop/premium/cup-strawberry.webp
- Frontend/public/sip-n-scoop/premium/cup-strawberry-480.webp
- Frontend/public/sip-n-scoop/premium/cup-tutti-frutti.webp
- Frontend/public/sip-n-scoop/premium/cup-tutti-frutti-480.webp
- Frontend/public/sip-n-scoop/premium/sundae-choco-brownie.webp
- Frontend/public/sip-n-scoop/premium/sundae-choco-brownie-480.webp
- Frontend/public/sip-n-scoop/premium/sundae-choco.webp
- Frontend/public/sip-n-scoop/premium/sundae-choco-480.webp
- Frontend/public/sip-n-scoop/premium/sundae-strawberry.webp
- Frontend/public/sip-n-scoop/premium/sundae-strawberry-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-nutty-belgian-dark-chocolate.webp
- Frontend/public/sip-n-scoop/premium/jumbo-nutty-belgian-dark-chocolate-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-rajbhog.webp
- Frontend/public/sip-n-scoop/premium/jumbo-rajbhog-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-rajwadi-kulfi-falooda.webp
- Frontend/public/sip-n-scoop/premium/jumbo-rajwadi-kulfi-falooda-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-kesar-pista.webp
- Frontend/public/sip-n-scoop/premium/jumbo-kesar-pista-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-chocolate-chips.webp
- Frontend/public/sip-n-scoop/premium/jumbo-chocolate-chips-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-premium-kaju-kishmish.webp
- Frontend/public/sip-n-scoop/premium/jumbo-premium-kaju-kishmish-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-american-nuts.webp
- Frontend/public/sip-n-scoop/premium/jumbo-american-nuts-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-vanilla.webp
- Frontend/public/sip-n-scoop/premium/jumbo-vanilla-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-dark-chocolate-zero-sugar.webp
- Frontend/public/sip-n-scoop/premium/jumbo-dark-chocolate-zero-sugar-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-kesar-pista-zero-sugar.webp
- Frontend/public/sip-n-scoop/premium/jumbo-kesar-pista-zero-sugar-480.webp
- Frontend/public/sip-n-scoop/premium/jumbo-vanilla-zero-sugar.webp
- Frontend/public/sip-n-scoop/premium/jumbo-vanilla-zero-sugar-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-matka.webp
- Frontend/public/sip-n-scoop/premium/kulfi-matka-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-kashmiri-kesar.webp
- Frontend/public/sip-n-scoop/premium/kulfi-kashmiri-kesar-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-chowpaty.webp
- Frontend/public/sip-n-scoop/premium/kulfi-chowpaty-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-dryfruit-rabdi.webp
- Frontend/public/sip-n-scoop/premium/kulfi-dryfruit-rabdi-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-raj-bhog.webp
- Frontend/public/sip-n-scoop/premium/kulfi-raj-bhog-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-mava-tillewali.webp
- Frontend/public/sip-n-scoop/premium/kulfi-mava-tillewali-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-shahi.webp
- Frontend/public/sip-n-scoop/premium/kulfi-shahi-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-bombay.webp
- Frontend/public/sip-n-scoop/premium/kulfi-bombay-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-rajwadi.webp
- Frontend/public/sip-n-scoop/premium/kulfi-rajwadi-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-mava-malai.webp
- Frontend/public/sip-n-scoop/premium/kulfi-mava-malai-480.webp
- Frontend/public/sip-n-scoop/premium/kulfi-sf-malai.webp
- Frontend/public/sip-n-scoop/premium/kulfi-sf-malai-480.webp
- Frontend/public/sip-n-scoop/premium/brick-rajbhog.webp
- Frontend/public/sip-n-scoop/premium/brick-rajbhog-480.webp
- Frontend/public/sip-n-scoop/premium/brick-kesar-pista.webp
- Frontend/public/sip-n-scoop/premium/brick-kesar-pista-480.webp
- Frontend/public/sip-n-scoop/premium/brick-american-nuts.webp
- Frontend/public/sip-n-scoop/premium/brick-american-nuts-480.webp
- Frontend/public/sip-n-scoop/premium/brick-almond-carnival.webp
- Frontend/public/sip-n-scoop/premium/brick-almond-carnival-480.webp
- Frontend/public/sip-n-scoop/premium/brick-choco-brownie.webp
- Frontend/public/sip-n-scoop/premium/brick-choco-brownie-480.webp
- Frontend/public/sip-n-scoop/premium/brick-chocolate-chips.webp
- Frontend/public/sip-n-scoop/premium/brick-chocolate-chips-480.webp
- Frontend/public/sip-n-scoop/premium/brick-kaju-draksh.webp
- Frontend/public/sip-n-scoop/premium/brick-kaju-draksh-480.webp
- Frontend/public/sip-n-scoop/premium/brick-alphonso-mango.webp
- Frontend/public/sip-n-scoop/premium/brick-alphonso-mango-480.webp
- Frontend/public/sip-n-scoop/premium/brick-cookie-cream.webp
- Frontend/public/sip-n-scoop/premium/brick-cookie-cream-480.webp
- Frontend/public/sip-n-scoop/premium/brick-black-currant.webp
- Frontend/public/sip-n-scoop/premium/brick-black-currant-480.webp
- Frontend/public/sip-n-scoop/premium/brick-tutti-frutti.webp
- Frontend/public/sip-n-scoop/premium/brick-tutti-frutti-480.webp
- Frontend/public/sip-n-scoop/premium/brick-crunchy-butter-scotch.webp
- Frontend/public/sip-n-scoop/premium/brick-crunchy-butter-scotch-480.webp
- Frontend/public/sip-n-scoop/premium/brick-strawberry.webp
- Frontend/public/sip-n-scoop/premium/brick-strawberry-480.webp
- Frontend/public/sip-n-scoop/premium/brick-vanilla.webp
- Frontend/public/sip-n-scoop/premium/brick-vanilla-480.webp
- Frontend/public/sip-n-scoop/premium/brick-taj-mahal.webp
- Frontend/public/sip-n-scoop/premium/brick-taj-mahal-480.webp
- Frontend/public/sip-n-scoop/premium/brick-butterscotch-cookie.webp
- Frontend/public/sip-n-scoop/premium/brick-butterscotch-cookie-480.webp
- Frontend/public/sip-n-scoop/premium/brick-italian-cassata.webp
- Frontend/public/sip-n-scoop/premium/brick-italian-cassata-480.webp
- Frontend/public/sip-n-scoop/premium/independence-water-750.webp
- Frontend/public/sip-n-scoop/premium/independence-water-750-480.webp
- Frontend/public/sip-n-scoop/premium/bisleri-1l.webp
- Frontend/public/sip-n-scoop/premium/bisleri-1l-480.webp
- Frontend/public/sip-n-scoop/premium/sprite-1l.webp
- Frontend/public/sip-n-scoop/premium/sprite-1l-480.webp
- Frontend/public/sip-n-scoop/premium/coca-cola-1l.webp
- Frontend/public/sip-n-scoop/premium/coca-cola-1l-480.webp
- Frontend/public/sip-n-scoop/premium/thums-up-1l.webp
- Frontend/public/sip-n-scoop/premium/thums-up-1l-480.webp
- Frontend/public/sip-n-scoop/premium/thums-up-xforce-10.webp
- Frontend/public/sip-n-scoop/premium/thums-up-xforce-10-480.webp
- Frontend/public/sip-n-scoop/premium/campa-orange-10.webp
- Frontend/public/sip-n-scoop/premium/campa-orange-10-480.webp
- Frontend/public/sip-n-scoop/premium/campa-cola-10.webp
- Frontend/public/sip-n-scoop/premium/campa-cola-10-480.webp
- Frontend/public/sip-n-scoop/premium/raskik-nimbu-paani-10.webp
- Frontend/public/sip-n-scoop/premium/raskik-nimbu-paani-10-480.webp
- Frontend/public/sip-n-scoop/premium/sip-coke-zero-10.webp
- Frontend/public/sip-n-scoop/premium/sip-coke-zero-10-480.webp
- Frontend/public/sip-n-scoop/premium/sip-lemon-jeera-10.webp
- Frontend/public/sip-n-scoop/premium/sip-lemon-jeera-10-480.webp
- Frontend/public/sip-n-scoop/premium/sip-frooti-10.webp
- Frontend/public/sip-n-scoop/premium/sip-frooti-10-480.webp

Generated build outputs under Frontend/.output, .wrangler and dependency caches are build artifacts, not hand-edited source files. Original assets remain for backward compatibility. Download/audit working files were moved to the system temporary directory.

# Tripathi Veg Restaurant — V9 Growth + Sip n Scoop Refresh

## What changed

- Expanded **Sip n Scoop** into a full quick-delivery catalog using the supplied Havmor posters and beverage photos.
- Added individual enhanced/cropped product images for cones, chocolate bars, dollies, fruit candy, ice candies, cups, sundae cups, jumbo cups, kulfis and brick/family packs.
- Added/updated beverages including Independence Water 750 ml ₹10, Bisleri 1 L ₹20, Sprite 1 L ₹50, Coca-Cola 1 L ₹50, Thums Up 1 L ₹50, Thums Up XForce ₹10, Campa Orange ₹10, Campa Cola ₹10 and RasKik Nimbu Paani ₹10. Existing ₹10 Coke Zero, Lemon Jeera and Frooti remain available.
- Sip n Scoop delivery is now **₹10 flat, maximum 3 km, delivery only**. The backend remains the source of truth and rejects out-of-range quick-delivery orders.
- WELCOME50 remains **₹50 off on item subtotal ₹399+**, but is now explicitly **one-time per customer account**. After successful redemption, the checkout coupon panel disappears for that logged-in account.
- Added server-side redemption tracking plus backward-compatible order-history checks so older redemptions cannot be reused.
- Added a versioned catalog migration (`seedVersion: 9`) so the V9 Sip n Scoop products/images/prices update the existing MongoDB catalog once on deployment, while later admin edits remain persistent across Render restarts.
- Old simplified Sip n Scoop seed products are automatically disabled to avoid duplicate items.

## Important deployment setting

For the strict 3 km Sip n Scoop boundary, keep the exact restaurant entrance coordinates in Render:

```env
RESTAURANT_LAT=your_exact_latitude
RESTAURANT_LNG=your_exact_longitude
```

Do not commit the real backend `.env` file to GitHub.

## Recommended post-deploy test

1. Confirm Sip n Scoop shows the expanded catalog and new images.
2. Confirm a location within 3 km gets a ₹10 Sip n Scoop delivery fee.
3. Confirm a location beyond 3 km is rejected.
4. Register/login with a test account, build a ₹399+ cart, apply WELCOME50 and place the order.
5. Start a new order with the same account and confirm the WELCOME50 panel is no longer shown and the backend rejects any attempted second redemption.
6. Add/edit/delete a temporary admin product and verify the change survives a backend restart.

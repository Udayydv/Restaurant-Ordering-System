/**
 * Seeds MongoDB with the restaurant's real menu so the existing
 * frontend (src/data/menu.ts) and the backend Cart/Order system
 * are backed by the same data.
 *
 * Each product is created with a `slug` matching the id already used
 * in the frontend menu (e.g. "shahi-paneer"). The cart controller
 * resolves either a real ObjectId or this slug to the same product,
 * so this seed is what actually fixes "Unable to add product to cart" —
 * before this script runs, there are no Product documents for the
 * frontend's item ids to resolve to.
 *
 * 14 dishes that are "Call for price" in the frontend (no numeric
 * price) are intentionally NOT seeded — the frontend already disables
 * "Add to cart" for those and shows a Call button instead.
 *
 * A handful of dishes (17) have a 3rd/4th price tier in the frontend
 * ("Family" / "Quarter") that the existing admin product form does not
 * have fields for (it only edits regular/half/full). Those tiers are
 * dropped during seeding; half/full are kept. You can add a "family"
 * price for those manually via a direct DB update if needed later —
 * the Product schema already accepts extra price fields even though
 * the admin form doesn't expose them yet.
 *
 * Usage:
 *   cd backend
 *   node src/scripts/seedProducts.js
 *
 * Safe to re-run: existing products are matched by slug and updated
 * in place rather than duplicated.
 */
import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Product from "../models/Product.js";
import Category from "../models/Category.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const products = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../seed-data/products.json"),
    "utf-8"
  )
);

const categories = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../seed-data/categories.json"),
    "utf-8"
  )
);

const run = async () => {
  const mongoURI =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/TripathiRestaurant";

  await mongoose.connect(mongoURI);
  console.log("🍃 MongoDB connected");

  let categoriesCreated = 0;
  let categoriesSkipped = 0;

  for (const cat of categories) {
    const existing = await Category.findOne({ name: cat.name });

    if (existing) {
      categoriesSkipped += 1;
      continue;
    }

    await Category.create(cat);
    categoriesCreated += 1;
  }

  let productsCreated = 0;
  let productsUpdated = 0;

  for (const p of products) {
    const existing = await Product.findOne({ slug: p.slug });

    if (existing) {
      existing.name = p.name;
      existing.description = p.description;
      existing.category = p.category;
      existing.prices = p.prices;
      existing.isAvailable = p.isAvailable;
      existing.isFeatured = p.isFeatured;
      existing.isBestseller = p.isBestseller;
      await existing.save();
      productsUpdated += 1;
    } else {
      await Product.create(p);
      productsCreated += 1;
    }
  }

  console.log("✅ Seed complete");
  console.log(`   Categories: ${categoriesCreated} created, ${categoriesSkipped} already existed`);
  console.log(`   Products:   ${productsCreated} created, ${productsUpdated} updated`);
  console.log("");
  console.log("Note: product images are not seeded — this script only seeds");
  console.log("name/description/category/prices/slug. The frontend menu");
  console.log("continues to use its own bundled images (src/assets/dishes),");
  console.log("since the UI must not be redesigned. If you add NEW products");
  console.log("from the admin panel, set an image URL there directly.");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

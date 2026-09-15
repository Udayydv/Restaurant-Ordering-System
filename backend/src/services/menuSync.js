import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Product from "../models/Product.js";
import Category from "../models/Category.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.join(__dirname, "../seed-data");

const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(seedDir, name), "utf-8"));

const products = readJson("products.json");
const categories = readJson("categories.json");
const legacySeededSlugs = readJson("legacy-seeded-slugs.json");

const legacyCategoryNames = [
  "paneer",
  "thali",
  "rice",
  "paratha",
  "roti",
  "aloo",
  "snacks",
  "chinese",
  "veg",
  "dal",
  "maggi",
  "beverages",
  "raita",
];

/**
 * Keep the MongoDB catalog aligned with the curated customer menu.
 * Safe to run repeatedly. This is intentionally also called during
 * backend startup so the exact database used by Render can never be
 * missing products that the frontend is allowed to order.
 */
export const syncMenuDatabase = async ({ log = false, preserveOperationalFlags = false } = {}) => {
  const tierMigration = await Product.collection.updateMany(
    {},
    {
      $unset: {
        "prices.quarter": "",
        "prices.family": "",
      },
    },
  );

  const activeCategoryNames = new Set(categories.map((c) => c.name));

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { name: cat.name },
      preserveOperationalFlags ? { $setOnInsert: cat } : { $set: cat },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  const retiredCategories = legacyCategoryNames.filter(
    (name) => !activeCategoryNames.has(name),
  );

  if (retiredCategories.length) {
    await Category.updateMany(
      { name: { $in: retiredCategories } },
      { $set: { isActive: false } },
    );
  }

  let productsCreated = 0;
  let productsUpdated = 0;
  let productsSuppressed = 0;

  for (const p of products) {
    const existing = await Product.findOne({ slug: p.slug }).select("_id isDeleted seedVersion");

    if (existing?.isDeleted) {
      productsSuppressed += 1;
      continue;
    }

    // Normal application startup must never overwrite edits made from the
    // admin panel (name, price, image, category, availability, etc.). The
    // exception is a deliberately versioned seed migration: when the seed
    // entry has a higher seedVersion than the document currently stored in
    // MongoDB, apply it exactly once. After that, later admin edits remain
    // stable because the stored seedVersion now matches the seed file.
    const incomingSeedVersion = Number(p.seedVersion || 0);
    const storedSeedVersion = Number(existing?.seedVersion || 0);
    const needsVersionedMigration =
      Boolean(existing) && incomingSeedVersion > storedSeedVersion;

    if (preserveOperationalFlags && existing && !needsVersionedMigration) {
      continue;
    }

    const updatePayload = { ...p };

    await Product.findOneAndUpdate(
      { slug: p.slug },
      { $set: updatePayload },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    if (existing) productsUpdated += 1;
    else productsCreated += 1;
  }

  const activeSlugs = new Set(products.map((p) => p.slug));
  const retiredSlugs = legacySeededSlugs.filter(
    (slug) => !activeSlugs.has(slug),
  );

  let retiredCount = 0;
  if (retiredSlugs.length) {
    const result = await Product.updateMany(
      { slug: { $in: retiredSlugs } },
      { $set: { isAvailable: false } },
    );
    retiredCount = result.modifiedCount || 0;
  }

  const result = {
    productsCreated,
    productsUpdated,
    productsSuppressed,
    retiredCount,
    cleanedTiers: tierMigration.modifiedCount || 0,
  };

  if (log) {
    console.log("✅ Menu/database synchronization complete");
    console.log(`   Products: ${productsCreated} created, ${productsUpdated} updated, ${productsSuppressed} admin-deleted kept hidden`);
    console.log(`   Retired products disabled: ${retiredCount}`);
    console.log(`   Obsolete Quarter/Family fields cleaned: ${result.cleanedTiers}`);
    console.log("   Pricing model: Regular OR Half/Full only");
  }

  return result;
};

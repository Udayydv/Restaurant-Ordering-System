import mongoose from "mongoose";

/*
 * Singleton document — there is always exactly one SiteSettings row.
 * Controllers use findOne() and create it on first access if it
 * doesn't exist yet, rather than relying on a fixed hardcoded _id.
 */
const siteSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    maintenanceMessage: {
      type: String,
      trim: true,
      default:
        "We're upgrading things behind the scenes to serve you better. We'll be back online shortly — thank you for your patience!",
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings =
  mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;

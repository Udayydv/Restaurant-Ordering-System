import SiteSettings from "../models/SiteSettings.js";
import { isRestaurantOpenNow, getOperatingHours } from "../utils/hours.js";
import { emitToCustomers } from "../socket.js";

const getOrCreateSettings = async () => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create({});
  }

  return settings;
};

// PUBLIC — checked by every visitor on page load to decide whether to
// show the maintenance page or the closed-for-the-day page.
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const { openTime, closeTime } = getOperatingHours();

    return res.status(200).json({
      success: true,
      settings: {
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        isRestaurantOpen: isRestaurantOpenNow(),
        openTime,
        closeTime,
      },
    });
  } catch (error) {
    console.error("Get public settings error:", error);

    // Fail open rather than accidentally locking out every customer
    // if this one read fails.
    return res.status(200).json({
      success: true,
      settings: {
        maintenanceMode: false,
        maintenanceMessage: "",
        isRestaurantOpen: true,
        openTime: "08:00",
        closeTime: "22:00",
      },
    });
  }
};

// ADMIN — view current settings
export const getAdminSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const { openTime, closeTime } = getOperatingHours();

    return res.status(200).json({
      success: true,
      settings: {
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        isRestaurantOpen: isRestaurantOpenNow(),
        openTime,
        closeTime,
      },
    });
  } catch (error) {
    console.error("Get admin settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch settings",
    });
  }
};

// ADMIN — toggle maintenance mode on/off, optionally update the message.
// Broadcasts the change to every connected customer in real time so
// the maintenance page appears/disappears without anyone needing to
// refresh.
export const updateAdminSettings = async (req, res) => {
  try {
    const { maintenanceMode, maintenanceMessage } = req.body;

    const settings = await getOrCreateSettings();

    if (typeof maintenanceMode === "boolean") {
      settings.maintenanceMode = maintenanceMode;
    }

    if (typeof maintenanceMessage === "string") {
      settings.maintenanceMessage = maintenanceMessage;
    }

    await settings.save();

    emitToCustomers("settings:changed", {
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    });

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update settings",
    });
  }
};

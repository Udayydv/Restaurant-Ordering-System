import Address from "../models/Address.js";
import { getDeliveryQuote } from "../utils/geo.js";

// GET ALL ADDRESSES
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch addresses",
    });
  }
};

// DELIVERY FEE QUOTE — given raw coordinates (e.g. straight from the
// browser's geolocation API before the address is even saved), return
// the distance from the restaurant and the resulting delivery fee.
// Lets the checkout page show the fee live as soon as location is
// picked, without creating an address first.
export const getDeliveryQuoteForCoords = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude are required",
      });
    }

    const quote = getDeliveryQuote(latitude, longitude);

    if (!quote.deliverable) {
      return res.status(200).json({
        success: true,
        deliverable: false,
        distanceKm: quote.distanceKm,
        message:
          quote.distanceKm === null
            ? "Invalid coordinates"
            : "Sorry, this address is outside our delivery range (10 km)",
      });
    }

    return res.status(200).json({
      success: true,
      deliverable: true,
      distanceKm: quote.distanceKm,
      deliveryFee: quote.deliveryFee,
    });
  } catch (error) {
    console.error("Delivery quote error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate delivery fee",
    });
  }
};

// CREATE ADDRESS
export const createAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      addressLine,
      landmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
      isDefault = false,
    } = req.body;

    if (
      !name ||
      !phone ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode",
      });
    }

    let distanceKm;
    let estimatedDeliveryFee;

    if (latitude !== undefined && longitude !== undefined) {
      const quote = getDeliveryQuote(latitude, longitude);

      if (!quote.deliverable) {
        return res.status(400).json({
          success: false,
          message:
            "Sorry, this location is outside our 10 km delivery range",
        });
      }

      distanceKm = quote.distanceKm;
      estimatedDeliveryFee = quote.deliveryFee;
    }

    // If this address is default, remove default from other addresses
    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      user: req.user._id,
      name,
      phone,
      addressLine,
      landmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
      distanceKm,
      estimatedDeliveryFee,
      isDefault,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("Create address error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create address",
    });
  }
};

// UPDATE ADDRESS
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (req.body.isDefault === true) {
      await Address.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    if (
      req.body.latitude !== undefined &&
      req.body.longitude !== undefined
    ) {
      const quote = getDeliveryQuote(
        req.body.latitude,
        req.body.longitude
      );

      if (!quote.deliverable) {
        return res.status(400).json({
          success: false,
          message:
            "Sorry, this location is outside our 10 km delivery range",
        });
      }

      req.body.distanceKm = quote.distanceKm;
      req.body.estimatedDeliveryFee = quote.deliveryFee;
    }

    Object.assign(address, req.body);

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update address",
    });
  }
};

// DELETE ADDRESS
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete address",
    });
  }
};

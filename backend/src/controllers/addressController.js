import Address from "../models/Address.js";
import { getDeliveryQuote, getSipNScoopDeliveryQuote } from "../utils/geo.js";

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

    const quickDelivery = req.query.service === "sip-n-scoop";
    const quote = quickDelivery
      ? getSipNScoopDeliveryQuote(latitude, longitude)
      : getDeliveryQuote(latitude, longitude);

    if (!quote.deliverable) {
      return res.status(200).json({
        success: true,
        deliverable: false,
        distanceKm: quote.distanceKm,
        message:
          quote.distanceKm === null
            ? "Invalid coordinates"
            : quickDelivery
              ? "Sip n Scoop is available only within 3 km"
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


// REVERSE GEOCODE PRECISE BROWSER COORDINATES — keeps third-party geocoding
// off the browser so production CORS/rate-limit differences do not break checkout.
export const reverseGeocodeCoords = async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: "Valid latitude and longitude are required" });
    }
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("namedetails", "1");
    url.searchParams.set("accept-language", "en");
    const response = await fetch(url, { headers: { "User-Agent": "TripathiVegRestaurant/1.0", Accept: "application/json" } });
    if (!response.ok) return res.status(502).json({ success: false, message: "Unable to resolve the detected location" });
    const data = await response.json();
    return res.status(200).json({ success: true, display_name: data.display_name || "", address: data.address || {} });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return res.status(502).json({ success: false, message: "Unable to auto-fill the address from your location" });
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

    if ((latitude !== undefined) !== (longitude !== undefined)) {
      return res.status(400).json({ success: false, message: "Provide both latitude and longitude" });
    }
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

    const allowedFields = ["name", "phone", "addressLine", "landmark", "city", "state", "pincode", "latitude", "longitude", "isDefault"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) address[field] = req.body[field];
    }
    if (!/^\d{10}$/.test(address.phone) || !/^\d{6}$/.test(address.pincode)) {
      return res.status(400).json({ success: false, message: "Invalid phone number or pincode" });
    }
    const hasLat = address.latitude != null;
    const hasLng = address.longitude != null;
    if (hasLat !== hasLng) return res.status(400).json({ success: false, message: "Provide both coordinates" });
    if (hasLat) {
      const quote = getDeliveryQuote(address.latitude, address.longitude);
      if (!quote.deliverable) return res.status(400).json({ success: false, message: "This address is outside the delivery range" });
      address.distanceKm = quote.distanceKm;
      address.estimatedDeliveryFee = quote.deliveryFee;
    }
    await address.validate();
    if (req.body.isDefault === true) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: address._id } }, { isDefault: false });
    }

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

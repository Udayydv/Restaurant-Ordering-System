import CateringEnquiry from "../models/CateringEnquiry.js";
import { emitToAdmins } from "../socket.js";

// SUBMIT CATERING ENQUIRY — public, optionally attached to a logged
// in user. Broadcasts to any connected admin dashboards in real time.
export const createEnquiry = async (req, res) => {
  try {
    const { name, phone, date, guests, occasion, notes } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name",
      });
    }

    if (!/^\d{10}$/.test(String(phone || "").replace(/\D/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number",
      });
    }

    const enquiry = await CateringEnquiry.create({
      name: String(name).trim(),
      phone: String(phone).replace(/\D/g, ""),
      date: date || "",
      guests: guests || "",
      occasion: occasion || "",
      notes: notes || "",
      user: req.user?._id,
    });

    // Real-time push to every connected admin dashboard.
    emitToAdmins("catering:new", enquiry);

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Create catering enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit enquiry",
    });
  }
};

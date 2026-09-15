import CateringEnquiry from "../models/CateringEnquiry.js";

// GET ALL CATERING ENQUIRIES — admin
export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await CateringEnquiry.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    console.error("Get catering enquiries error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch enquiries",
    });
  }
};

// UPDATE ENQUIRY STATUS — admin
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["new", "contacted", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const enquiry = await CateringEnquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry updated successfully",
      enquiry,
    });
  } catch (error) {
    console.error("Update catering enquiry error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update enquiry",
    });
  }
};

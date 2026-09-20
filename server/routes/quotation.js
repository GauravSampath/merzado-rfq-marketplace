
const express = require("express");
const mongoose = require("mongoose");
const Quotation = require("../models/Quotation");
const RFQ = require("../models/RFQ");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Supplier: submit a quotation for an open RFQ
router.post("/:rfqId", protect, allowRoles("supplier"), async (req, res) => {
    try {
        const { price, deliveryTime, notes } = req.body;
        const { rfqId } = req.params;

        if (!mongoose.isValidObjectId(rfqId)) {
            return res.status(400).json({ message: "Invalid RFQ ID." });
        }

        if (
            price === undefined ||
            !Number.isFinite(Number(price)) ||
            Number(price) <= 0
        ) {
            return res.status(400).json({
                message: "Price must be a number greater than zero."
            });
        }

        if (typeof deliveryTime !== "string" || !deliveryTime.trim()) {
            return res.status(400).json({
                message: "Please provide a delivery time."
            });
        }

        if (notes !== undefined && typeof notes !== "string") {
            return res.status(400).json({
                message: "Notes must be text."
            });
        }

        const rfq = await RFQ.findById(rfqId);

        if (!rfq || rfq.status !== "open" || rfq.deadline <= new Date()) {
            return res.status(404).json({
                message: "This RFQ is not available for quotations."
            });
        }

        if (rfq.buyer.toString() === req.user.userId) {
            return res.status(403).json({
                message: "You cannot submit a quotation for your own RFQ."
            });
        }

        const quotation = await Quotation.create({
            rfq: rfq._id,
            supplier: req.user.userId,
            price: Number(price),
            deliveryTime: deliveryTime.trim(),
            notes: notes?.trim() || ""
        });

        res.status(201).json({
            message: "Quotation submitted successfully.",
            quotation
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already submitted a quotation for this RFQ."
            });
        }

        console.error("Submit quotation error:", error.message);
        res.status(500).json({ message: "Failed to submit quotation." });
    }
});

// Supplier: view quotations they have submitted
router.get("/my/submitted", protect, allowRoles("supplier"), async (req, res) => {
    try {
        const quotations = await Quotation.find({
            supplier: req.user.userId
        })
            .populate("rfq", "title type location deadline status")
            .sort({ createdAt: -1 });

        res.status(200).json(quotations);
    } catch (error) {
        console.error("Fetch submitted quotations error:", error.message);
        res.status(500).json({
            message: "Failed to fetch your quotations."
        });
    }
});

// Buyer: view quotations received for an RFQ they own
router.get("/rfq/:rfqId", protect, allowRoles("buyer"), async (req, res) => {
    try {
        const { rfqId } = req.params;

        if (!mongoose.isValidObjectId(rfqId)) {
            return res.status(400).json({ message: "Invalid RFQ ID." });
        }

        const rfq = await RFQ.findOne({
            _id: rfqId,
            buyer: req.user.userId
        });

        if (!rfq) {
            return res.status(404).json({
                message: "RFQ not found or you do not own it."
            });
        }

        const quotations = await Quotation.find({ rfq: rfq._id })
            .populate("supplier", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(quotations);
    } catch (error) {
        console.error("Fetch RFQ quotations error:", error.message);
        res.status(500).json({
            message: "Failed to fetch quotations for this RFQ."
        });
    }
});

module.exports = router;
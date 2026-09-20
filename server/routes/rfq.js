
const express = require("express");
const RFQ = require("../models/RFQ");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all open RFQs (buyers and suppliers can browse)
router.get("/", protect, async (req, res) => {
    try {
        const rfqs = await RFQ.find({ status: "open" })
            .populate("buyer", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(rfqs);
    } catch (error) {
        console.error("Fetch RFQs error:", error.message);
        res.status(500).json({ message: "Failed to fetch RFQs." });
    }
});

// Get RFQs created by the logged-in buyer
router.get("/my", protect, allowRoles("buyer"), async (req, res) => {
    try {
        const rfqs = await RFQ.find({ buyer: req.user.userId })
            .sort({ createdAt: -1 });

        res.status(200).json(rfqs);
    } catch (error) {
        console.error("Fetch my RFQs error:", error.message);
        res.status(500).json({ message: "Failed to fetch your RFQs." });
    }
});

// Create an RFQ
router.post("/", protect, allowRoles("buyer"), async (req, res) => {
    try {
        const { title, type, description, quantity, location, deadline } = req.body;

        if (!title || !type || !description || quantity == null || !location || !deadline) {
            return res.status(400).json({
                message: "Please provide all required RFQ fields."
            });
        }

        if (!["product", "service"].includes(type)) {
            return res.status(400).json({
                message: "Type must be product or service."
            });
        }

        if (!Number.isFinite(Number(quantity)) || Number(quantity) < 1) {
            return res.status(400).json({
                message: "Quantity must be a number greater than or equal to 1."
            });
        }

        const parsedDeadline = new Date(deadline);

        if (Number.isNaN(parsedDeadline.getTime()) || parsedDeadline <= new Date()) {
            return res.status(400).json({
                message: "Deadline must be a valid future date."
            });
        }

        const rfq = await RFQ.create({
            buyer: req.user.userId,
            title: title.trim(),
            type,
            description: description.trim(),
            quantity: Number(quantity),
            location: location.trim(),
            deadline: parsedDeadline
        });

        res.status(201).json({
            message: "RFQ created successfully.",
            rfq
        });
    } catch (error) {
        console.error("Create RFQ error:", error.message);
        res.status(500).json({ message: "Failed to create RFQ." });
    }
});

// Update an RFQ owned by the logged-in buyer
router.put("/:id", protect, allowRoles("buyer"), async (req, res) => {
    try {
        const rfq = await RFQ.findOne({
            _id: req.params.id,
            buyer: req.user.userId
        });

        if (!rfq) {
            return res.status(404).json({
                message: "RFQ not found or you do not own it."
            });
        }

        const { title, type, description, quantity, location, deadline, status } = req.body;

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({ message: "Title cannot be empty." });
            }
            rfq.title = title.trim();
        }

        if (type !== undefined) {
            if (!["product", "service"].includes(type)) {
                return res.status(400).json({ message: "Type must be product or service." });
            }
            rfq.type = type;
        }

        if (description !== undefined) {
            if (typeof description !== "string" || !description.trim()) {
                return res.status(400).json({ message: "Description cannot be empty." });
            }
            rfq.description = description.trim();
        }

        if (quantity !== undefined) {
            if (!Number.isFinite(Number(quantity)) || Number(quantity) < 1) {
                return res.status(400).json({ message: "Quantity must be at least 1." });
            }
            rfq.quantity = Number(quantity);
        }

        if (location !== undefined) {
            if (typeof location !== "string" || !location.trim()) {
                return res.status(400).json({ message: "Location cannot be empty." });
            }
            rfq.location = location.trim();
        }

        if (deadline !== undefined) {
            const parsedDeadline = new Date(deadline);
            if (Number.isNaN(parsedDeadline.getTime()) || parsedDeadline <= new Date()) {
                return res.status(400).json({ message: "Deadline must be a valid future date." });
            }
            rfq.deadline = parsedDeadline;
        }

        if (status !== undefined) {
            if (!["open", "closed"].includes(status)) {
                return res.status(400).json({ message: "Status must be open or closed." });
            }
            rfq.status = status;
        }

        await rfq.save();

        res.status(200).json({
            message: "RFQ updated successfully.",
            rfq
        });
    } catch (error) {
        console.error("Update RFQ error:", error.message);
        res.status(500).json({ message: "Failed to update RFQ." });
    }
});

// Delete an RFQ owned by the logged-in buyer
router.delete("/:id", protect, allowRoles("buyer"), async (req, res) => {
    try {
        const rfq = await RFQ.findOneAndDelete({
            _id: req.params.id,
            buyer: req.user.userId
        });

        if (!rfq) {
            return res.status(404).json({
                message: "RFQ not found or you do not own it."
            });
        }

        res.status(200).json({ message: "RFQ deleted successfully." });
    } catch (error) {
        console.error("Delete RFQ error:", error.message);
        res.status(500).json({ message: "Failed to delete RFQ." });
    }
});

module.exports = router;
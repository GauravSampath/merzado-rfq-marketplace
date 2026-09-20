const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
    {
        rfq: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RFQ",
            required: true
        },

        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0.01
        },

        deliveryTime: {
            type: String,
            required: true,
            trim: true
        },

        notes: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// Prevent the same supplier from quoting the same RFQ more than once.
quotationSchema.index(
    { rfq: 1, supplier: 1 },
    { unique: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
const express = require("express");
const authRoutes = require("./routes/auth");
const cors = require("cors");
const rfqRoutes = require("./routes/rfq");
const quotationRoutes = require("./routes/quotation");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/rfqs", rfqRoutes);
app.use("/api/quotations", quotationRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "MERZADO RFQ Marketplace API is running!"
    });
});

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });
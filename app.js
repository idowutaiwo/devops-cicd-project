const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("DevOps CI/CD Pipeline is working!");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy"
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Application running on port ${PORT}`);
    });
}

module.exports = app;

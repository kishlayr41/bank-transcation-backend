const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("server is connected to DB");
    } catch (error) {
        console.log("MongoDB error:", error.message);
        process.exit(1);
    }
};

module.exports = connectToDB;
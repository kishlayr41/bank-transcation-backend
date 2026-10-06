require("dotenv").config();

const mongoose = require("mongoose");
const UserModel = require("./src/models/user.model");
const accountModel = require("./src/models/account.model");

async function createSystemUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        let systemUser = await UserModel.findOne({
            email: "system@ledger.com"
        }).select("+systemUser");

        if (!systemUser) {
            systemUser = await UserModel.create({
                name: "System User",
                email: "system@ledger.com",
                password: "system123",
                systemUser: true
            });
        } else {
            systemUser.systemUser = true;
            await systemUser.save();
        }

        let systemAccount = await accountModel.findOne({
            userId: systemUser._id
        });

        if (!systemAccount) {
            systemAccount = await accountModel.create({
                userId: systemUser._id,
                status: "ACTIVE",
                currency: "INR"
            });
        }

        console.log("System user:", systemUser._id);
        console.log("System account:", systemAccount._id);

        process.exit();

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

createSystemUser();
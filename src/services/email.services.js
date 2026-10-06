require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

transporter.verify((error) => {
    if (error) {
        console.error("Error connecting to email server:", error);
    } else {
        console.log("Email server is ready to send messages");
    }
});


const sendEmail = async (to, subject, text, html) => {
    try {
        console.log("SENDING EMAIL TO:", to);

        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        console.log("MESSAGE ID:", info.messageId);
        console.log("RESPONSE:", info.response);

    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};


async function sendRegistrationEmail(userEmail, name) {

    const subject = "Welcome to Backend Ledger!";

    const text = `Hello ${name},

Thank you for registering at Backend Ledger.
We're excited to have you on board!

Best regards,
The Backend Ledger Team`;

    const html = `
        <p>Hello ${name},</p>

        <p>
            Thank you for registering on Backend Ledger.
            We are excited to have you on board!
        </p>

        <p>
            Best regards,<br>
            The Backend Ledger Team
        </p>
    `;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
}


async function sendTranscationEmail(
    userEmail,
    name,
    amount,
    toAccount
) {

    const subject = "Transaction Successful!";

    const text = `Hello ${name},

Your transaction of $${amount} to account ${toAccount} was successful.

Best regards,
The Backend Ledger Team`;

    const html = `
        <p>Hello ${name},</p>

        <p>
            Your transaction of $${amount}
            to account ${toAccount} was successful.
        </p>

        <p>
            Best regards,<br>
            The Backend Ledger Team
        </p>
    `;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
}


async function sendTranscationFailureEmail(
    userEmail,
    name,
    amount,
    toAccount
) {

    const subject = "Transaction Failed!";

    const text = `Hello ${name},

Your transaction of $${amount} to account ${toAccount} was unsuccessful.

Please try again later.

Best regards,
The Backend Ledger Team`;

    const html = `
        <p>Hello ${name},</p>

        <p>
            Your transaction of $${amount}
            to account ${toAccount} was unsuccessful.
        </p>

        <p>
            Please try again later.
        </p>

        <p>
            Best regards,<br>
            The Backend Ledger Team
        </p>
    `;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
}


module.exports = {
    sendRegistrationEmail,
    sendTranscationEmail,
    sendTranscationFailureEmail
};


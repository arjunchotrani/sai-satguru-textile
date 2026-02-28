import nodemailer from "nodemailer";
import type { Env } from "../types/env";

export const sendEmail = async (
    env: Env,
    to: string,
    subject: string,
    html: string
) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: env.MAIL_USER,
            pass: env.MAIL_PASS, // App Password
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Sai Satguru Textiles" <${env.MAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message || error };
    }
};

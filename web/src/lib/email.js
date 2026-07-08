import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendEmail = async (payload) => {
  if (!resend) {
    console.log("=========================================");
    console.log("📧 MOCK EMAIL SENT (No Resend API Key)");
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Body: ${payload.html.substring(0, 200)}...`);
    console.log("=========================================");
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: "Naren's Studio <hello@narensstudio.com>", // You must verify this domain in Resend
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
};

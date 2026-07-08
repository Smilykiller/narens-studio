"use server";

import { sendEmail } from "@/lib/email";

export async function submitContact(formData) {
  try {
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const subject = formData.get("subject");
    const message = formData.get("message");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@narensstudio.com";

    await sendEmail({
      to: adminEmail,
      subject: `New Contact Form Inquiry: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #FF6B00;">New Inquiry Received</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="padding: 16px; background: #f4f4f4; border-radius: 8px; margin-top: 16px;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error("Contact Form Error:", err);
    return { success: false, error: "Failed to send message" };
  }
}

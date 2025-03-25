// src/app/api/send-contract-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { to, contractLink } = await request.json();

    // Configure the transporter with SMTP details from environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // Set to false if SSL/TLS is not required on connection
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Your Event Contract",
      html: `<p>Thank you for choosing us for your event!</p>
             <p>Please review your contract by clicking the link below:</p>
             <p><a href="${contractLink}">View Contract</a></p>
             <p>If you agree, please sign the contract online.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
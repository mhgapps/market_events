// src/app/api/send-contract-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { to, contractLink } = await request.json();
    
    // Configure the transporter with your SMTP server details
    const transporter = nodemailer.createTransport({
      host: "mail.smtp2go.com",
      port: 2525,
      secure: false, // Use false if your SMTP server doesn't require SSL/TLS on connection
      auth: {
        user: "noreply@markethospitalitygroup.com",
        pass: "rDBD3IzClGz9oW6N",
      },
    });
    
    const mailOptions = {
      from: "noreply@markethospitalitygroup.com",
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
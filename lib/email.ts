import nodemailer from "nodemailer";
import { formatDateTime, centsToCurrency } from "./utils";

// Make sure to add EMAIL_USER and EMAIL_PASS to your .env file
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const STUDIO_EMAIL = process.env.EMAIL_USER || "arglamstudio@example.com";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.arglamstudio.com";
const LOGO_IMG = `<img src="${BASE_URL}/ar-glam-studio-logo.svg" alt="AR Glam Studio" style="max-height: 80px; margin-bottom: 20px;" />`;

// Generalized send function
async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Skipping email send: EMAIL_USER or EMAIL_PASS not configured in .env variables.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"AR Glam Studio" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(",") : to,
      subject,
      html,
    });
    console.log(`✉️ Email successfully sent to: ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

export async function sendNewBookingEmail(appointment: any) {
  const timeString = formatDateTime(appointment.scheduledAt);
  const serviceList = appointment.services.map((s: any) => `<li>${s.serviceName} - ${centsToCurrency(s.priceCents || 0)}</li>`).join("");
  const totalCost = centsToCurrency(appointment.totalPriceCents || 0);

  const customerHtml = `
    <div style="text-align: center;">${LOGO_IMG}</div>
    <h2>Booking Confirmed!</h2>
    <p>Hi ${appointment.name},</p>
    <p>Your appointment at AR Glam Studio has been successfully booked.</p>
    <p><strong>When:</strong> ${timeString}</p>
    <p><strong>Services Booked:</strong></p>
    <ul>${serviceList}</ul>
    <p><strong>Total Estimated Cost:</strong> ${totalCost}</p>
    <br/>
    <p><strong>Location:</strong> 800 Walworth Drive, Prosper, TX</p>
    <p>If you need to change your appointment, please contact us at (469) 469-8217, or manage your bookings online at <a href="${BASE_URL}/my-bookings">${BASE_URL}/my-bookings</a>.</p>
    <p>Thank you,<br/>AR Glam Studio</p>
  `;

  const hostHtml = `
    <div>${LOGO_IMG}</div>
    <h2>New Appointment Alert! 🎉</h2>
    <p><strong>Customer:</strong> ${appointment.name}</p>
    <p><strong>Phone:</strong> ${appointment.phone}</p>
    <p><strong>Email:</strong> ${appointment.email}</p>
    <p><strong>When:</strong> ${timeString}</p>
    <p><strong>Services:</strong></p>
    <ul>${serviceList}</ul>
    <p><strong>Total Value:</strong> ${totalCost}</p>
  `;

  // Send to Customer
  await sendEmail(appointment.email, "Your AR Glam Studio Booking Confirmation", customerHtml);
  // Send to Host
  await sendEmail(STUDIO_EMAIL, `New Booking: ${appointment.name} on ${timeString}`, hostHtml);
}

export async function sendBookingModifiedEmail(appointment: any, oldTime: Date, newTime: Date) {
  const oldTimeString = formatDateTime(oldTime);
  const newTimeString = formatDateTime(newTime);
  const serviceList = appointment.services.map((s: any) => `<li>${s.serviceName} - ${centsToCurrency(s.priceCents || 0)}</li>`).join("");
  const totalCost = centsToCurrency(appointment.totalPriceCents || 0);

  const customerHtml = `
    <div style="text-align: center;">${LOGO_IMG}</div>
    <h2>Booking Update</h2>
    <p>Hi ${appointment.name},</p>
    <p>Your upcoming appointment at AR Glam Studio has been modified.</p>
    <p><strong>Old Time:</strong> <strike>${oldTimeString}</strike></p>
    <p><strong>New Time:</strong> ${newTimeString}</p>
    <p><strong>Services:</strong></p>
    <ul>${serviceList}</ul>
    <p><strong>Estimated Total:</strong> ${totalCost}</p>
    <br/>
    <p>If you need to change your appointment, please contact us at (469) 469-8217, or manage your bookings online at <a href="${BASE_URL}/my-bookings">${BASE_URL}/my-bookings</a>.</p>
    <p>Looking forward to seeing you!<br/>AR Glam Studio</p>
  `;

  // Send to Customer
  await sendEmail(appointment.email, "Update: Your AR Glam Studio Appointment", customerHtml);
  
  // Send to Host for record
  await sendEmail(STUDIO_EMAIL, `Updated Booking: ${appointment.name}`, `
    <div>${LOGO_IMG}</div>
    <h2>Booking Adjusted</h2>
    <p>${appointment.name}'s appointment has been manually moved.</p>
    <p><strong>From:</strong> ${oldTimeString}</p>
    <p><strong>To:</strong> ${newTimeString}</p>
    <br/>
    <p><strong>Updated Services:</strong></p>
    <ul>${serviceList}</ul>
    <p><strong>New Total Value:</strong> ${totalCost}</p>
  `);
}

export async function sendBookingCancelledEmail(appointment: any) {
  const timeString = formatDateTime(appointment.scheduledAt);

  const customerHtml = `
    <div style="text-align: center;">${LOGO_IMG}</div>
    <h2>Booking Cancelled</h2>
    <p>Hi ${appointment.name},</p>
    <p>Your appointment scheduled for <strong>${timeString}</strong> has been cancelled by the studio.</p>
    <p>If you have any questions or would like to reschedule, please give us a call at (469) 469-8217, or review your bookings online at <a href="${BASE_URL}/my-bookings">${BASE_URL}/my-bookings</a>.</p>
    <p>Thank you,<br/>AR Glam Studio</p>
  `;

  // Send to Customer only (Host is the one who cancelled it from Admin so they know)
  await sendEmail(appointment.email, "Cancelled: AR Glam Studio Appointment", customerHtml);
}
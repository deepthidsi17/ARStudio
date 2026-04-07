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
async function sendEmail(to: string | string[], subject: string, html: string, icalContent?: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Skipping email send: EMAIL_USER or EMAIL_PASS not configured in .env variables.");
    return;
  }

  const mailOptions: any = {
    from: `"AR Glam Studio" <${process.env.EMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(",") : to,
    subject,
    html,
  };

  if (icalContent) {
    mailOptions.icalEvent = {
        filename: 'booking.ics',
        method: 'request',
        content: icalContent
    };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully sent to: ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

function generateIcalEvent(appointment: any, studioEmail: string): string {
  const formatIcalDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const start = new Date(appointment.scheduledAt);
  let end = appointment.endTime ? new Date(appointment.endTime) : new Date(start.getTime() + 60 * 60000);

  const servicesText = appointment.services.map((s: any) => s.serviceName).join(", ");
  const dtstamp = formatIcalDate(new Date());

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AR Glam Studio//Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${appointment.id}@arglamstudio.com
DTSTAMP:${dtstamp}
DTSTART:${formatIcalDate(start)}
DTEND:${formatIcalDate(end)}
ORGANIZER;CN="AR Glam Studio":mailto:${studioEmail}
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:mailto:${studioEmail}
SUMMARY:Studio Booking: ${appointment.name}
DESCRIPTION:Customer: ${appointment.name}\\nPhone: ${appointment.phone}\\nEmail: ${appointment.email}\\nServices: ${servicesText}
LOCATION:800 Walworth Drive, Prosper, TX
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
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
  // Send to Host with iCal invite
  const icalData = generateIcalEvent(appointment, STUDIO_EMAIL);
  await sendEmail(STUDIO_EMAIL, `New Booking: ${appointment.name} on ${timeString}`, hostHtml, icalData);
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
  
  // Send to Host for record with iCal invite
  const icalData = generateIcalEvent(appointment, STUDIO_EMAIL);
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
  `, icalData);
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


export async function sendBookingCompletedEmail(appointment: any) {
  const customerHtml = `
    <div style="text-align: center;">${LOGO_IMG}</div>
    <h2>Thank You for Choosing Us! ❤️</h2>
    <p>Hi ${appointment.name},</p>
    <p>Thank you so much for your recent visit to AR Glam Studio. It was a pleasure having you!</p>
    <p>We are always striving to improve and would love to hear your feedback on your experience. If you loved your service, we'd greatly appreciate it if you could recommend us to your friends and family.</p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
    <br/>
    <p>Ready to book again? Visit <a href="${BASE_URL}">${BASE_URL}</a> to schedule your next appointment.</p>
    <p>Warmly,<br/>AR Glam Studio</p>
  `;

  await sendEmail(appointment.email, "Thank You from AR Glam Studio! How did we do?", customerHtml);
}
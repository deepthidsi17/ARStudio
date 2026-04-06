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

function generateServiceListHtml(services: any[]) {
  const addOnKeywords = ["Travel", "Early Morning"];
  const isAddOn = (name: string) => addOnKeywords.some((kw) => name.includes(kw));

  const isMakeup = (name: string) => ["Basic Everyday Glam", "Party & Event Look", "Hair Styles"].includes(name);
  const isSaree = (name: string) => name.includes("Saree") || name.includes("Lehenga");
  const isFacial = (name: string) => name.includes("Facial") || name.includes("D-Tan");
  const isThreading = (name: string) => name.includes("Threading");
  const isWaxing = (name: string) => name.includes("Waxing");
  const isHenna = (name: string) => name === "Henna Hair Color";
  const isMassage = (name: string) => name === "Hair Oil Massage" || name === "Back Massage";
  const isPackage = (name: string) => name === "Party Package" || name === "Bridal Package";

  const makeupServices = services.filter((s) => isMakeup(s.name)).sort((a, b) => {
    const order = ["Hair Styles", "Basic Everyday Glam", "Party & Event Look"];
    const indexA = order.findIndex(name => a.name.trim() === name);
    const indexB = order.findIndex(name => b.name.trim() === name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  const sareeServices = services.filter((s) => isSaree(s.name)).sort((a, b) => {
    const order = ["Saree Draping", "Saree Pre-pleating", "Full Saree Iron + Pre-pleating", "Full Saree Iron + Pre-pleating + Draping", "Lehenga Draping"];
    const indexA = order.findIndex(name => a.name.trim() === name);
    const indexB = order.findIndex(name => b.name.trim() === name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  const facialServices = services.filter((s) => isFacial(s.name)).sort((a, b) => {
    const order = ["Herbal Facial", "Fruit Facial", "Wine Facial", "Pearl Facial", "Gold Facial", "Diamond Facial", "D-Tan", "D-Tan + Facial"];
    const indexA = order.findIndex(name => a.name.trim() === name);
    const indexB = order.findIndex(name => b.name.trim() === name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  const threadingServices = services.filter((s) => isThreading(s.name)).sort((a, b) => {
    const order = ["Eyebrow Threading", "Upper Lip Threading", "Lower Chin Threading", "Forehead Threading", "Jawline Threading", "Full Face Threading"];
    const indexA = order.findIndex(name => a.name.trim() === name);
    const indexB = order.findIndex(name => b.name.trim() === name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  const waxingServices = services.filter((s) => isWaxing(s.name) && s.name.trim() !== "Forehead Waxing").sort((a, b) => {
    const order = ["Upper Lip Waxing", "Chin Waxing", "Side Face Waxing", "Underarms Waxing", "Hands Waxing", "Half Legs Waxing", "Full Legs Waxing"];
    const indexA = order.findIndex(name => a.name.trim() === name);
    const indexB = order.findIndex(name => b.name.trim() === name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  const hennaServices = services.filter((s) => isHenna(s.name));
  const massageServices = services.filter((s) => isMassage(s.name));
  const packageServices = services.filter((s) => isPackage(s.name)).sort((a, b) => {
    const order = ["Party Package", "Bridal Package"];
    const indexA = order.findIndex(name => a.name.trim() === name);
    const indexB = order.findIndex(name => b.name.trim() === name);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  const addOns = services.filter((s) => isAddOn(s.name)).sort((a, b) => {
    const order = ["Travel Within 5 Miles", "Travel 5 to 10 Miles", "Travel 10 to 15 Miles", "Travel Over 15 Miles", "Early Morning / Late Evening Slot"];
    const indexA = order.findIndex(name => a.name.includes(name));
    const indexB = order.findIndex(name => b.name.includes(name));
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  let html = "";
  const renderGroup = (title: string, groupServices: any[]) => {
    if (groupServices.length === 0) return "";
    let groupHtml = `<h4 style="margin-top: 15px; margin-bottom: 5px; color: #444; font-weight: 600;">${title}</h4>`;
    groupHtml += `<ul style="line-height: 1.6; margin-top: 0; padding-left: 20px;">`;
    groupHtml += groupServices.map(s => `<li>${s.name} - ${centsToCurrency(s.priceDefault || 0)}</li>`).join("");
    groupHtml += `</ul>`;
    return groupHtml;
  };

  html += renderGroup("Makeup & Hair", makeupServices);
  html += renderGroup("Facials & D-Tan", facialServices);
  html += renderGroup("Threading", threadingServices);
  html += renderGroup("Waxing", waxingServices);
  html += renderGroup("Saree & Lehenga", sareeServices);
  html += renderGroup("Henna Hair Color", hennaServices);
  html += renderGroup("Massage", massageServices);
  html += renderGroup("Special Packages", packageServices);
  html += renderGroup("Travel & Add-ons", addOns);

  return html;
}

export async function sendBookingCompletedEmail(appointment: any, allServices: any[]) {
  const serviceList = generateServiceListHtml(allServices);

  const customerHtml = `
    <div style="text-align: center;">${LOGO_IMG}</div>
    <h2>Thank You for Choosing Us! ❤️</h2>
    <p>Hi ${appointment.name},</p>
    <p>Thank you so much for your recent visit to AR Glam Studio. It was a pleasure having you!</p>
    <p>We are always striving to improve and would love to hear your feedback on your experience. If you loved your service, we'd greatly appreciate it if you could recommend us to your friends and family.</p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
    <h3>Our Services</h3>
    <p>For your next visit, check out our full range of services:</p>
    <div style="text-align: left; max-width: 500px; margin: 0 auto; background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #f0f0f0;">
      ${serviceList}
    </div>
    <br/>
    <p>Ready to book again? Visit <a href="${BASE_URL}">${BASE_URL}</a> to schedule your next appointment.</p>
    <p>Warmly,<br/>AR Glam Studio</p>
  `;

  await sendEmail(appointment.email, "Thank You from AR Glam Studio! How did we do?", customerHtml);
}
const dns = require('dns');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Set default DNS resolution to IPv4 first
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const generateOTP = () => {
  return crypto.randomInt(1000, 9999).toString();
};

// Helper to send email via Resend HTTP API (HTTPS port 443 - never blocked by cloud firewalls)
const sendViaResend = async (email, otp) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'GetResumeAI <onboarding@resend.dev>',
      to: [email],
      subject: 'GetResumeAI - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f97316; text-align: center;">GetResumeAI</h2>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h3 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h3>
            <p style="color: #666; margin-bottom: 20px;">Your verification code is:</p>
            <div style="background: #fff; padding: 20px; text-align: center; border-radius: 8px; border: 2px dashed #f97316; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 12px;">This code will expire in 10 minutes.</p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Resend API Error: ${errText}`);
  }
  return response.json();
};

const sendOTPEmail = async (email, otp) => {
  // 1. Try Resend HTTP API if key is configured (Bypasses all SMTP blocking)
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`[Email] Dispatching OTP to ${email} via Resend HTTP API...`);
      const res = await sendViaResend(email, otp);
      console.log('[Email] OTP sent successfully via Resend API');
      return res;
    } catch (apiErr) {
      console.warn('[Email] Resend API failed, falling back to SMTP:', apiErr.message);
    }
  }

  // 2. Try SMTP via Nodemailer with 5s timeout
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, (err, address) => {
          if (err) return callback(err);
          callback(null, address, 4);
        });
      },
      connectionTimeout: 5000, // Fast 5s timeout if hosting blocks SMTP
      greetingTimeout: 5000,
      socketTimeout: 8000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"GetResumeAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'GetResumeAI - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f97316; text-align: center;">GetResumeAI</h2>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h3 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h3>
            <p style="color: #666; margin-bottom: 20px;">Your verification code is:</p>
            <div style="background: #fff; padding: 20px; text-align: center; border-radius: 8px; border: 2px dashed #f97316; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 12px;">This code will expire in 10 minutes.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('[Email] OTP sent successfully via Gmail SMTP');
      return info;
    } catch (smtpErr) {
      console.warn('[Email Notice] SMTP connection failed/blocked by hosting provider:', smtpErr.message);
      // Fall through to console logging
    }
  }

  // 3. Fallback log for development & free hosting where outbound SMTP ports are firewalled
  console.log(`\n============================================================\n🔑 [GETRESUME.AI OTP DISPATCH]\n📧 To: ${email}\n🔢 Code: ${otp}\n⏰ Expires: 10 minutes\n============================================================\n`);
  return { simulated: true, otp };
};

module.exports = { generateOTP, sendOTPEmail };

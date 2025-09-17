import nodemailer from 'nodemailer';

// Email service that works with hosting providers like Render
export const createEmailTransporter = () => {
  // Check if we have SendGrid API key (recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    console.log('📧 Using SendGrid configuration');
    return nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Check if we have Mailgun credentials
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    console.log('📧 Using Mailgun configuration');
    return nodemailer.createTransporter({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
        pass: process.env.MAILGUN_API_KEY,
      },
    });
  }

  // Try Gmail configurations (may not work on some hosting providers)
  const configs = [
    // Configuration 1: Gmail with App Password (most reliable if allowed)
    {
      name: 'Gmail Service',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.Email,
          pass: process.env.EmailPassword,
        },
        pool: true,
        maxConnections: 1,
        rateDelta: 20000,
        rateLimit: 5,
      }
    },
    // Configuration 2: STARTTLS on port 587
    {
      name: 'Gmail STARTTLS',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.Email,
          pass: process.env.EmailPassword,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
      }
    },
    // Configuration 3: SSL on port 465
    {
      name: 'Gmail SSL',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.Email,
          pass: process.env.EmailPassword,
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    }
  ];

  // Return the first working configuration
  for (const { name, config } of configs) {
    try {
      const transporter = nodemailer.createTransporter(config);
      console.log(`📧 Created transporter with ${name} configuration`);
      return transporter;
    } catch (error) {
      console.log(`❌ Failed to create transporter with ${name}:`, error.message);
    }
  }

  throw new Error('All email configurations failed. Consider using SendGrid or Mailgun for production.');
};

export const sendEmail = async (transporter, mailOptions) => {
  try {
    console.log('📧 Attempting to send email via transporter...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId, info };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    
    // If SMTP fails, try to provide helpful guidance
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('💡 SMTP connection blocked. Consider using:');
      console.error('   - SendGrid: Set SENDGRID_API_KEY environment variable');
      console.error('   - Mailgun: Set MAILGUN_API_KEY and MAILGUN_DOMAIN');
      console.error('   - Or use a different hosting provider that allows SMTP');
    }
    
    return { success: false, error: error.message };
  }
};

// Fallback: Log email to console for development/testing
export const logEmailToConsole = (mailOptions) => {
  console.log('📧 EMAIL WOULD BE SENT:');
  console.log('📧 From:', mailOptions.from);
  console.log('📧 To:', mailOptions.to);
  console.log('📧 Subject:', mailOptions.subject);
  console.log('📧 Text:', mailOptions.text);
  console.log('📧 HTML preview available in logs');
  return { success: true, messageId: 'console-' + Date.now() };
};
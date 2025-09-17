import nodemailer from 'nodemailer';

// Simple email configuration for production environments
export const createEmailTransporter = () => {
  // Try multiple configurations for different hosting environments
  const configs = [
    // Configuration 1: STARTTLS on port 587
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
        }
      }
    },
    // Configuration 2: SSL on port 465
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
    },
    // Configuration 3: Service-based (fallback)
    {
      name: 'Gmail Service',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.Email,
          pass: process.env.EmailPassword,
        }
      }
    }
  ];

  // Return the first working configuration
  for (const { name, config } of configs) {
    try {
      const transporter = nodemailer.createTransport(config);
      console.log(`📧 Created transporter with ${name} configuration`);
      return transporter;
    } catch (error) {
      console.log(`❌ Failed to create transporter with ${name}:`, error.message);
    }
  }

  throw new Error('All email configurations failed');
};

export const sendEmail = async (transporter, mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId, info };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};
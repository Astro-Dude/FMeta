import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import sgMail from '@sendgrid/mail';
import User from "../models/user.model.js";
import Post from "../models/post.model.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d"
  });
};

// Email sending utility function
const sendVerificationEmail = async (email, name, token) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const fromEmail = process.env.SENDGRID_VERIFIED_SENDER || process.env.Email || 'noreply@fmeta.app';

    // Check if SendGrid API key is available (use API for production - works on Render)
    if (process.env.SENDGRID_API_KEY) {
      console.log('📧 Using SendGrid API for email delivery (Render-compatible)');
      
      // Set SendGrid API key
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      // Prepare email message
      const msg = {
        to: email,
        from: {
          email: fromEmail,
          name: 'F Meta'
        },
        subject: 'Verify your email address',
        text: `Hello ${name},

Thank you for signing up with F Meta.

To complete your account setup, please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours.

If you did not create this account, please ignore this email.

Best regards,
The F Meta Team`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email Address</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7f7f7;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px;">
                    <tr>
                      <td style="padding: 40px 40px 30px 40px;">
                        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 24px 0; font-weight: 600; line-height: 1.3;">Verify your email address</h1>
                        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Hi ${name},</p>
                        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                          Thank you for signing up with F Meta. To complete your account setup and start using our platform, please verify your email address.
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                          <tr>
                            <td style="background-color: #5b5fc7; border-radius: 6px; text-align: center;">
                              <a href="${verificationUrl}" style="display: inline-block; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;" target="_blank">Verify Email Address</a>
                            </td>
                          </tr>
                        </table>
                        <p style="color: #6a6a6a; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                          Or copy and paste this URL into your browser:
                        </p>
                        <p style="color: #5b5fc7; font-size: 13px; word-break: break-all; margin: 0 0 24px 0; padding: 12px; background-color: #f7f7f7; border-radius: 4px;">
                          ${verificationUrl}
                        </p>
                        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
                        <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0;">
                          This verification link will expire in 24 hours.
                        </p>
                        <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5; margin: 0;">
                          If you did not create an account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
                        <p style="color: #8a8a8a; font-size: 13px; margin: 0 0 8px 0; line-height: 1.4;">
                          Best regards,<br>The F Meta Team
                        </p>
                        <p style="color: #b0b0b0; font-size: 12px; margin: 0; line-height: 1.4;">
                          &copy; ${new Date().getFullYear()} F Meta. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.4;">
                          This email was sent to ${email} because you signed up for F Meta.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

      // Send email using SendGrid API
      const response = await sgMail.send(msg);
      
      console.log("✅ Verification email sent successfully via SendGrid API!");
      console.log("📧 Status Code:", response[0].statusCode);
      console.log("📧 Email sent to:", email);
      return { success: true, messageId: response[0].headers['x-message-id'] };
      
    } 
    // Fallback to Gmail SMTP if SendGrid is not configured (for localhost only)
    else if (process.env.Email && process.env.EmailPassword) {
      console.log('📧 Using Gmail SMTP for email delivery (localhost fallback)');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.Email,
          pass: process.env.EmailPassword,
        },
        secure: true,
        requireTLS: true,
        tls: {
          rejectUnauthorized: false
        }
      });

      const info = await transporter.sendMail({
        from: `"F Meta" <${fromEmail}>`,
        to: email,
        subject: "Verify your email address",
        replyTo: fromEmail,
        text: `Hello ${name},

Thank you for signing up with F Meta.

To complete your account setup, please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours.

If you did not create this account, please ignore this email.

Best regards,
The F Meta Team`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email Address</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7f7f7;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px;">
                    <tr>
                      <td style="padding: 40px 40px 30px 40px;">
                        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 24px 0; font-weight: 600; line-height: 1.3;">Verify your email address</h1>
                        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Hi ${name},</p>
                        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                          Thank you for signing up with F Meta. To complete your account setup and start using our platform, please verify your email address.
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                          <tr>
                            <td style="background-color: #5b5fc7; border-radius: 6px; text-align: center;">
                              <a href="${verificationUrl}" style="display: inline-block; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;" target="_blank">Verify Email Address</a>
                            </td>
                          </tr>
                        </table>
                        <p style="color: #6a6a6a; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                          Or copy and paste this URL into your browser:
                        </p>
                        <p style="color: #5b5fc7; font-size: 13px; word-break: break-all; margin: 0 0 24px 0; padding: 12px; background-color: #f7f7f7; border-radius: 4px;">
                          ${verificationUrl}
                        </p>
                        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
                        <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0;">
                          This verification link will expire in 24 hours.
                        </p>
                        <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5; margin: 0;">
                          If you did not create an account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
                        <p style="color: #8a8a8a; font-size: 13px; margin: 0 0 8px 0; line-height: 1.4;">
                          Best regards,<br>The F Meta Team
                        </p>
                        <p style="color: #b0b0b0; font-size: 12px; margin: 0; line-height: 1.4;">
                          &copy; ${new Date().getFullYear()} F Meta. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.4;">
                          This email was sent to ${email} because you signed up for F Meta.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'X-Entity-Ref-ID': `fmeta-${Date.now()}`,
          'Message-ID': `<${Date.now()}.${email.replace('@', '-at-')}@fmeta.app>`,
        }
      });
      
      console.log("✅ Verification email sent successfully!");
      console.log("📧 Message ID:", info.messageId);
      console.log("📧 Email sent to:", email);
      return { success: true, messageId: info.messageId };
    } 
    else {
      throw new Error('Email configuration missing. Please set SENDGRID_API_KEY or (Email and EmailPassword) in .env file');
    }

  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    console.error("❌ Error details:", error.message);
    if (error.response) {
      console.error("❌ SendGrid Response:", error.response.body);
    }
    return { success: false, error: error.message };
  }
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, username } = req.body;

    // Validation - name, username, password are required, and either email or phone
    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, username and password are required"
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Either email or phone number is required"
      });
    }

    // Build query to check for existing user (email, phone, or username)
    const existingUserQuery = [{ username }]; // Username must always be unique
    if (email) existingUserQuery.push({ email });
    if (phone) existingUserQuery.push({ phone });

    // Check if user already exists (email, phone, or username)
    const existingUser = await User.findOne({
      $or: existingUserQuery
    });

    if (existingUser) {
      let message = "User already exists with this ";
      if (existingUser.username === username) {
        message += "username";
      } else if (existingUser.email === email) {
        message += "email";
      } else if (existingUser.phone === phone) {
        message += "phone number";
      }
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object with required fields
    const userObj = {
      name,
      username,
      password: hashedPassword
    };

    // Add email and/or phone if provided
    if (email) {
      userObj.email = email;
      // Generate email verification token
      userObj.emailVerificationToken = crypto.randomBytes(32).toString('hex');
      userObj.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      userObj.isEmailVerified = false;
    }
    if (phone) userObj.phone = phone;

    // Create new user
    const newUser = new User(userObj);

    await newUser.save();

    // Send verification email if email is provided
    if (email) {
      console.log("Attempting to send email to:", email);
      const emailResult = await sendVerificationEmail(email, name, newUser.emailVerificationToken);
      
      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error);
        // Don't throw error - registration should still succeed even if email fails
        // But we could add additional logging or notifications here
      }
    }

    // Generate token only if email is verified OR if no email provided
    let token = null;
    let message = "User registered successfully";
    
    if (email) {
      message = "Registration successful! Please check your email to verify your account before logging in.";
    } else {
      // If no email provided, allow immediate access
      token = generateToken(newUser._id);
    }

    // Return user data without password
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      bio: newUser.bio,
      followers: newUser.followers,
      following: newUser.following,
      relationship_status: newUser.relationship_status,
      posts: newUser.posts,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    const response = {
      success: true,
      message,
      user: userResponse
    };
    
    if (token) {
      response.token = token;
    }
    
    res.status(201).json(response);

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required"
      });
    }

    console.log(`🔍 Verifying token: ${token}`);
    console.log(`⏰ Current time: ${new Date(Date.now())}`);

    // Find user with this verification token (check token first, then expiration)
    const user = await User.findOne({
      emailVerificationToken: token
    });

    if (!user) {
      console.log(`❌ No user found with token: ${token}`);
      return res.status(400).json({
        success: false,
        message: "Invalid verification token"
      });
    }

    console.log(`👤 Found user: ${user.email}`);
    console.log(`⏰ Token expires: ${new Date(user.emailVerificationExpires)}`);
    console.log(`⏰ Current time: ${new Date(Date.now())}`);
    console.log(`✅ Token valid: ${user.emailVerificationExpires > Date.now()}`);

    // Check if token is expired
    if (user.emailVerificationExpires <= Date.now()) {
      console.log(`⏰ Token expired for user: ${user.email}`);
      return res.status(400).json({
        success: false,
        message: "Verification token has expired. Please request a new verification email."
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      console.log(`✅ Email already verified for user: ${user.email}`);
      return res.status(200).json({
        success: true,
        message: "Email is already verified! You can now log in.",
        alreadyVerified: true
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log(`✅ Email verified successfully for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isEmailVerified: true
      }
    });

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { emailOrPhoneOrUsername, password } = req.body;

    // Validation
    if (!emailOrPhoneOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/phone/username and password are required"
      });
    }

    // Find user by email, phone, or username
    const user = await User.findOne({
      $or: [
        { email: emailOrPhoneOrUsername },
        { phone: emailOrPhoneOrUsername },
        { username: emailOrPhoneOrUsername }
      ]
    }).populate('followers following posts');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if email is verified (only if user has an email)
    if (user.email && !user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email address before logging in. Check your email for the verification link."
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      relationship_status: user.relationship_status,
      posts: user.posts,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Verify token and get user profile
export const getProfile = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    // Get user from database
    const user = await User.findById(decoded.userId)
      .populate('followers following posts')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Get profile error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Logout user (client-side token removal, optional server-side blacklisting)
export const logoutUser = async (req, res) => {
  try {
    // In a more advanced implementation, you could blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    // Generate new token
    const newToken = generateToken(decoded.userId);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken
    });

  } catch (error) {
    console.error("Refresh token error:", error);
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get user profile data
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user with populated followers, following, and posts
    const user = await User.findById(userId)
      .select('-password -emailVerificationToken -emailVerificationExpires')
      .populate('followers following', 'username name')
      .populate('posts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate actual counts from arrays
    const profileData = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      postCount: user.posts.length,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      user: profileData
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get user posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all posts by the user
    const posts = await Post.find({ author: userId })
      .populate('author', 'username name profilePicture')
      .populate('likes', 'username')
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 }); // Most recent first

    // Transform posts to include counts and proper image URLs
    const transformedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      imageUrl: post.images && post.images.length > 0 ? post.images[0] : null,
      images: post.images,
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.comments ? post.comments.length : 0,
      author: post.author,
      location: post.location,
      hashtags: post.hashtags,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.status(200).json({
      success: true,
      posts: transformedPosts,
      count: transformedPosts.length
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts',
      error: error.message
    });
  }
};

// Search users by username
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    // Search for users whose username contains the query (case-insensitive)
    const users = await User.find({
      username: { $regex: query.trim(), $options: 'i' }
    })
    .select('-password -emailVerificationToken -emailVerificationExpires')
    .limit(20); // Limit results to 20 users

    res.status(200).json({
      success: true,
      users: users,
      count: users.length
    });

  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const currentUserId = decoded.userId;
    const { userId } = req.params;

    // Can't follow yourself
    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself"
      });
    }

    // Get both users
    const currentUser = await User.findById(currentUserId);
    const userToFollow = await User.findById(userId);

    if (!currentUser || !userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already following
    const isAlreadyFollowing = currentUser.following.includes(userId);

    if (isAlreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user"
      });
    }

    // Add to following list of current user
    currentUser.following.push(userId);
    await currentUser.save();

    // Add to followers list of user being followed
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: "User followed successfully",
      isFollowing: true
    });

  } catch (error) {
    console.error("Follow user error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const currentUserId = decoded.userId;
    const { userId } = req.params;

    // Can't unfollow yourself
    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself"
      });
    }

    // Get both users
    const currentUser = await User.findById(currentUserId);
    const userToUnfollow = await User.findById(userId);

    if (!currentUser || !userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if actually following
    const isFollowing = currentUser.following.includes(userId);

    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user"
      });
    }

    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    await currentUser.save();

    // Remove from followers list of user being unfollowed
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
      isFollowing: false
    });

  } catch (error) {
    console.error("Unfollow user error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Check if current user is following another user
export const checkFollowStatus = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const currentUserId = decoded.userId;
    const { userId } = req.params;

    // Get both users to check mutual follow status
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(userId);

    if (!currentUser || !otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isFollowing = currentUser.following.includes(userId);
    const isFollowingMe = otherUser.following.includes(currentUserId);

    res.status(200).json({
      success: true,
      isFollowing: isFollowing,
      isFollowingMe: isFollowingMe
    });

  } catch (error) {
    console.error("Check follow status error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all posts for the home feed with pagination
export const getAllPosts = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const currentUserId = decoded.userId;

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get current user to check following status
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get all posts with pagination
    const posts = await Post.find({})
      .populate('author', 'username name')
      .populate('likes', 'username')
      .populate('comments.user', 'username name')
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const totalPosts = await Post.countDocuments({});
    const totalPages = Math.ceil(totalPosts / limit);
    const hasNextPage = page < totalPages;

    // Transform posts to include counts, follow status, and proper structure
    const transformedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      imageUrl: post.images && post.images.length > 0 ? post.images[0] : null,
      images: post.images,
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.comments ? post.comments.length : 0,
      author: {
        ...post.author.toObject(),
        isFollowedByCurrentUser: currentUser.following.includes(post.author._id),
        isCurrentUser: post.author._id.toString() === currentUserId
      },
      location: post.location,
      hashtags: post.hashtags,
      isLikedByCurrentUser: post.likes ? post.likes.some(like => like._id.toString() === currentUserId) : false,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.status(200).json({
      success: true,
      posts: transformedPosts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalPosts: totalPosts,
        hasNextPage: hasNextPage,
        limit: limit
      }
    });

  } catch (error) {
    console.error("Get all posts error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get feed posts for the current user (followed users only)
export const getFeedPosts = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const currentUserId = decoded.userId;

    // Get current user to find who they're following
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get posts from users that the current user is following + their own posts
    const followingIds = [...currentUser.following, currentUserId];

    const posts = await Post.find({ author: { $in: followingIds } })
      .populate('author', 'username name')
      .populate('likes', 'username')
      .populate('comments.user', 'username name')
      .sort({ createdAt: -1 }) // Most recent first
      .limit(20); // Limit to 20 posts

    // Transform posts to include counts and proper structure
    const transformedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      imageUrl: post.images && post.images.length > 0 ? post.images[0] : null,
      images: post.images,
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.comments ? post.comments.length : 0,
      author: post.author,
      location: post.location,
      hashtags: post.hashtags,
      isLikedByCurrentUser: post.likes ? post.likes.some(like => like._id.toString() === currentUserId) : false,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.status(200).json({
      success: true,
      posts: transformedPosts,
      count: transformedPosts.length
    });

  } catch (error) {
    console.error("Get feed posts error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

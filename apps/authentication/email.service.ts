/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  async sendVerificationEmail(
    email: string,
    verificationCode: string,
  ): Promise<{ messageId: string; accepted: string[] }> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { border: 1px solid #eaeaea; border-radius: 8px; padding: 30px; }
              .header { color: #2563eb; font-size: 24px; margin-bottom: 20px; }
              .code { 
                background: #f3f4f6; 
                padding: 15px 25px; 
                font-size: 28px; 
                font-weight: bold; 
                text-align: center; 
                margin: 25px 0;
                border-radius: 6px;
                letter-spacing: 2px;
                color: #1e40af;
              }
              .footer { 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #eaeaea;
                font-size: 12px;
                color: #6b7280;
              }
              .logo { 
                max-width: 150px; 
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="https://yourdomain.com/logo.png" alt="Company Logo" class="logo">
              <h1 class="header">Verify Your Email</h1>
              <p>Thank you for registering! Please use the following verification code to complete your signup:</p>
              
              <div class="code">${verificationCode}</div>
              
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this email, please ignore it.</p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                <p>
                  <a href="https://yourdomain.com" style="color: #2563eb; text-decoration: none;">Our Website</a> | 
                  <a href="https://yourdomain.com/privacy" style="color: #2563eb; text-decoration: none;">Privacy Policy</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Verify Your Email Address
          -------------------------
          
          Thank you for registering! Here's your verification code:
          
          ${verificationCode}
          
          This code expires in 10 minutes.
          
          If you didn't request this email, please ignore it.
          
          © ${new Date().getFullYear()} Your Company Name
          Website: https://yourdomain.com
        `,
      };

      console.log(
        'Outgoing email content:',
        JSON.stringify(mailOptions, null, 2),
      );

      // ACTUAL FIX: Properly await the sendMail call
      const info = await this.transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      });

      return {
        messageId: info.messageId,
        accepted: info.accepted,
      };
    } catch (error) {
      console.error('Email sending failed:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

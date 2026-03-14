/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AlertDto } from 'src/events/dto/alert.dto';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }) as nodemailer.Transporter;
  }

  async sendMail(alert: AlertDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: alert.to,
      subject: alert.subject,
      text: alert.message,
    });
  }
}

import { transporter, createTransporter } from './transporter'

export async function sendEmail({
  fromName,
  replyTo,
  to,
  subject,
  html
}) {
  const transport = transporter || createTransporter()
  if (!transport) {
    throw new Error('SMTP not configured')
  }

  return transport.sendMail({
    from: `"${fromName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    replyTo,
    to,
    subject,
    html
  })
}

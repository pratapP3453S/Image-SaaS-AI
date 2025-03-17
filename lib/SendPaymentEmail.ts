// import { render } from "@react-email/render";
import PaymentSuccessfulEmail from "./emails/PaymentSuccessfulEmail";
import PaymentUnuccessfulEmail from "./emails/PaymentUnsuccessfulEmail";
import RegisterSuccessfulEmail from "./emails/RegisterSuccessfulEmail";
// import sgMail from "@sendgrid/mail";
// import { MailDataRequired } from "@sendgrid/helpers/classes/mail";
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Set the SendGrid API Key
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendPaymentSuccessEmail(
  to: string,
  productName: string,
  amount: number,
  razorpayOrderId: string
): Promise<any> {
  try {
    await resend.emails.send({
      // from: process.env.SENDER_EMAIL!,
      from: 'onboarding@resend.dev',
      to: to,
      subject: "Payment Successful for Your Image | Image E-Comm",
      react: PaymentSuccessfulEmail({ email: to, productName, amount, razorpayOrderId }),
    });
    return { success: true, message: "Payment email send successfully." };
  } catch (error: any) {
    console.log("Error sending email.", error);
    return { success: false, message: "Failed to send email" };
  }
}

export async function sendPaymentUnsuccessEmail(
  to: string,
  productName: string,
  amount: number,
  razorpayOrderId: string
): Promise<any> {
  try {
    await resend.emails.send({
      // from: process.env.SENDER_EMAIL!,
      from: 'onboarding@resend.dev',
      to: to,
      subject: "Payment Unsuccessful for Your Image | Image E-Comm",
      react: PaymentUnuccessfulEmail({ email: to, productName, amount, razorpayOrderId }),
    });
    return { success: true, message: "Payment email send successfully." };
  } catch (error: any) {
    console.log("Error sending email.", error);
    return { success: false, message: "Failed to send email" };
  }
}

export async function sendSuccessfulRegistrationEmail(
  to: string,
  password: string,
  role: string
): Promise<any> {
  try {
    await resend.emails.send({
      // from: process.env.SENDER_EMAIL!,
      from: 'onboarding@resend.dev',
      to: to,
      subject: "Test message | Image-Kit",
      react: RegisterSuccessfulEmail({ to, password, role }),
    });
    return { success: true, message: "Verification email send successfully." };
  } catch (emailError) {
    console.log("Error sending verification email.", emailError);
    return { success: false, message: "Failed to send verification email" };
  }
}

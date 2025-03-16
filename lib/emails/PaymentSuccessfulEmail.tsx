import { Html, Head, Body, Container, Text, Link, Section, Button } from '@react-email/components';

interface PaymentSuccessfulEmailProps {
  email: string;
  productName: string;
  amount: number;
  razorpayOrderId: string;
  // receiptUrl: string;
}

export default function PaymentSuccessfulEmail({
  email,
  productName,
  amount,
  razorpayOrderId,
}: PaymentSuccessfulEmailProps) {
  return (
    <Html>
      <Head>
        <title>Payment Successful</title>
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={headingStyle}>Payment Successful</Text>
          <Text style={textStyle}>Hi {email},</Text>
          <Text style={textStyle}>
            Your payment of <strong>{amount}</strong> for product <strong>{productName}</strong> was successful. Below are
            the details of your transaction:
          </Text>
          <Section style={sectionStyle}>
            <Text style={textStyle}>
              <strong>Transaction ID:</strong> {razorpayOrderId}
            </Text>
            <Text style={textStyle}>
              <strong>Amount:</strong> {amount}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const bodyStyle = {
  backgroundColor: '#f6f6f6',
  fontFamily: 'Arial, sans-serif',
  padding: '20px',
};

const containerStyle = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '600px',
  margin: '0 auto',
};

const headingStyle = {
  fontSize: '24px',
  color: '#333333',
  marginBottom: '20px',
};

const textStyle = {
  fontSize: '16px',
  color: '#555555',
  marginBottom: '10px',
};

const sectionStyle = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
};

const buttonStyle = {
  backgroundColor: '#22c55e',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '5px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '20px 0',
};

const footerStyle = {
  fontSize: '14px',
  color: '#777777',
  marginTop: '20px',
};

const linkStyle = {
  color: '#22c55e',
  textDecoration: 'none',
};
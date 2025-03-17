import { Html, Head, Body, Container, Text, Section } from "@react-email/components";

interface RegisterSuccessfulfulEmailProps {
  to: string;
  password: string;
  role: string;
  // receiptUrl: string;
}

export default function RegisterSuccessfulEmail({
  to,
  password,
  role,
}: RegisterSuccessfulfulEmailProps) {
  return (
    <Html>
      <Head>
        <title>Successful Registered</title>
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={headingStyle}>Payment Successful</Text>
          <Text style={textStyle}>Hi {to},</Text>
          {/* <Text style={textStyle}>
            Your payment of <strong>{amount}</strong> was successful. Below are
            the details of your transaction:
          </Text> */}
          <Text style={textStyle}>
          Thank you for registering with Image-Kit! We&apos;re thrilled to have you on board. 🚀
          </Text>
          <Section style={sectionStyle}>
            <Text style={textStyle}>
              <strong>Your Password is: </strong> {password}
            </Text>
            <Text style={textStyle}>
              <strong>Role you selected: </strong> {role}
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
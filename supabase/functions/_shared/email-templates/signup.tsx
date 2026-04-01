/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

const LOGO_URL = 'https://skzkshigufdtvcekfsqs.supabase.co/storage/v1/object/public/email-assets/logo-symbol.png'
const SUPPORT_EMAIL = 'support@vertexglobalmarkets.com'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email to get started with Vertex Global Markets</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        {/* Header */}
        <Section style={header}>
          <Img src={LOGO_URL} alt="Vertex Global Markets" width="48" height="48" style={logo} />
          <Text style={brandName}>
            <span style={{ color: '#3CB371' }}>Vertex</span>{' '}
            <span style={{ color: '#4A90D9' }}>Global</span>{' '}
            <span style={{ color: '#8B5CF6' }}>Markets</span>
          </Text>
        </Section>

        {/* Body */}
        <Section style={body}>
          <Heading style={h1}>Confirm Your Email Address</Heading>
          <Text style={text}>
            Hello{recipient ? ` ${recipient}` : ''},
          </Text>
          <Text style={text}>
            Welcome to Vertex Global Markets.
          </Text>
          <Text style={text}>
            To complete your registration and secure your account, please confirm your email address by clicking the button below:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>
              Confirm Email
            </Button>
          </Section>
          <Text style={textMuted}>
            If you did not create this account, please ignore this email.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Hr style={hr} />
          <Text style={text}>
            Thank you,
          </Text>
          <Text style={footerBrand}>Vertex Global Markets Team</Text>
          <Text style={footerText}>
            Need help? Contact us at{' '}
            <Link href={`mailto:${SUPPORT_EMAIL}`} style={footerLink}>{SUPPORT_EMAIL}</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#f4f4f5', fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", padding: '20px 0' }
const wrapper = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' as const, border: '1px solid #e5e7eb' }
const header = { backgroundColor: '#0f172a', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0 auto 12px', borderRadius: '8px' }
const brandName = { fontSize: '20px', fontWeight: '700' as const, margin: '0', letterSpacing: '0.5px' }
const body = { padding: '40px 40px 32px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: '0 0 16px' }
const textMuted = { fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 24px' }
const link = { color: '#3CB371', textDecoration: 'underline' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#3CB371', color: '#ffffff', fontSize: '16px', fontWeight: '600' as const, borderRadius: '10px', padding: '14px 36px', textDecoration: 'none', display: 'inline-block' }
const trustText = { fontSize: '13px', color: '#9ca3af', textAlign: 'center' as const, margin: '8px 0 0' }
const footer = { padding: '0 40px 32px' }
const hr = { borderColor: '#e5e7eb', margin: '0 0 24px' }
const footerBrand = { fontSize: '14px', fontWeight: '600' as const, color: '#374151', margin: '0 0 4px', textAlign: 'center' as const }
const footerText = { fontSize: '12px', color: '#9ca3af', margin: '0 0 4px', textAlign: 'center' as const }
const footerLink = { color: '#3CB371', textDecoration: 'underline' }
const footerDisclaimer = { fontSize: '11px', color: '#d1d5db', margin: '12px 0 0', textAlign: 'center' as const }

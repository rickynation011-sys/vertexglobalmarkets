/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Vertex Global Markets'
const LOGO_URL = 'https://skzkshigufdtvcekfsqs.supabase.co/storage/v1/object/public/email-assets/logo-symbol.png'
const SUPPORT_EMAIL = 'support@vertexglobalmarkets.com'

interface AdminNewDepositProps {
  userName?: string; userEmail?: string; amount?: string; method?: string; currency?: string; submittedAt?: string
}

const AdminNewDepositEmail = ({ userName = 'A user', userEmail = '', amount = '0.00', method = 'Crypto', currency = 'USD', submittedAt = new Date().toISOString() }: AdminNewDepositProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New deposit request: ${amount} from {userName}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Section style={header}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="48" height="48" style={logo} />
          <Text style={brandName}><span style={{ color: '#3CB371' }}>Vertex</span>{' '}<span style={{ color: '#4A90D9' }}>Global</span>{' '}<span style={{ color: '#8B5CF6' }}>Markets</span></Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>New Deposit Request</Heading>
          <Text style={text}>A new deposit has been submitted and requires your review.</Text>
          <Section style={detailsBox}>
            <Text style={detailRow}><span style={bold}>User:</span> {userName} ({userEmail})</Text>
            <Text style={detailRow}><span style={bold}>Amount:</span> ${amount}</Text>
            <Text style={detailRow}><span style={bold}>Method:</span> {method}</Text>
            <Text style={detailRow}><span style={bold}>Currency:</span> {currency}</Text>
            <Text style={detailRow}><span style={bold}>Submitted:</span> {new Date(submittedAt).toLocaleString()}</Text>
          </Section>
          <Text style={text}>Please log in to the admin dashboard to review and process this deposit.</Text>
        </Section>
        <Section style={footer}>
          <Hr style={hr} />
          <Text style={footerBrand}>{SITE_NAME} — Admin Notification</Text>
          <Text style={footerText}><Link href={`mailto:${SUPPORT_EMAIL}`} style={footerLink}>{SUPPORT_EMAIL}</Link></Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNewDepositEmail,
  subject: (data: Record<string, any>) => `New Deposit: $${data.amount || '0'} from ${data.userName || 'a user'}`,
  displayName: 'Admin: New Deposit Notification',
  previewData: { userName: 'John Doe', userEmail: 'john@example.com', amount: '1,000.00', method: 'BTC', currency: 'BTC', submittedAt: new Date().toISOString() },
} satisfies TemplateEntry

const main = { backgroundColor: '#f4f4f5', fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", padding: '20px 0' }
const wrapper = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' as const, border: '1px solid #e5e7eb' }
const header = { backgroundColor: '#0f172a', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0 auto 12px', borderRadius: '8px' }
const brandName = { fontSize: '20px', fontWeight: '700' as const, margin: '0', letterSpacing: '0.5px' }
const body = { padding: '40px 40px 32px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#f9fafb', borderRadius: '10px', padding: '16px 20px', margin: '16px 0', border: '1px solid #e5e7eb' }
const detailRow = { fontSize: '14px', color: '#374151', lineHeight: '1.8', margin: '0' }
const footer = { padding: '0 40px 32px' }
const hr = { borderColor: '#e5e7eb', margin: '0 0 24px' }
const footerBrand = { fontSize: '14px', fontWeight: '600' as const, color: '#374151', margin: '0 0 4px', textAlign: 'center' as const }
const footerText = { fontSize: '12px', color: '#9ca3af', margin: '0 0 4px', textAlign: 'center' as const }
const footerLink = { color: '#3CB371', textDecoration: 'underline' }

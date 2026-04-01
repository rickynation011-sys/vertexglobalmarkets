import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Vertex Global Markets'
const SITE_URL = 'https://vertexglobalmarkets.com'
const LOGO_URL = 'https://skzkshigufdtvcekfsqs.supabase.co/storage/v1/object/public/email-assets/logo-symbol.png'
const SUPPORT_EMAIL = 'support@vertexglobalmarkets.com'

interface Props { name?: string; subject?: string }

const TicketReplyEmail = ({ name, subject }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New reply to your support ticket — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Section style={header}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="48" height="48" style={logo} />
          <Text style={brandName}><span style={{ color: '#3CB371' }}>Vertex</span>{' '}<span style={{ color: '#4A90D9' }}>Global</span>{' '}<span style={{ color: '#8B5CF6' }}>Markets</span></Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>New Reply to Your Ticket</Heading>
          <Text style={text}>{name ? `Hello ${name},` : 'Hello,'}</Text>
          <Text style={text}>
            Our support team has responded to your ticket{subject ? <>: "<span style={bold}>{subject}</span>"</> : ''}. Please check your dashboard for the full details.
          </Text>
          <Section style={infoBox}>
            <Text style={infoText}>Our team is here to help. Feel free to reply if you have further questions.</Text>
          </Section>
          <Section style={buttonContainer}>
            <Button style={button} href={`${SITE_URL}/dashboard/contact`}>View Ticket</Button>
          </Section>
        </Section>
        <Section style={footer}>
          <Hr style={hr} />
          <Text style={footerBrand}>{SITE_NAME}</Text>
          <Text style={footerText}>Need help? <Link href={`mailto:${SUPPORT_EMAIL}`} style={footerLink}>{SUPPORT_EMAIL}</Link></Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TicketReplyEmail,
  subject: 'New Reply to Your Support Ticket',
  displayName: 'Support ticket reply',
  previewData: { name: 'John', subject: 'Withdrawal inquiry' },
} satisfies TemplateEntry

const main = { backgroundColor: '#f4f4f5', fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", padding: '20px 0' }
const wrapper = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' as const, border: '1px solid #e5e7eb' }
const header = { backgroundColor: '#0f172a', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0 auto 12px', borderRadius: '8px' }
const brandName = { fontSize: '20px', fontWeight: '700' as const, margin: '0', letterSpacing: '0.5px' }
const body = { padding: '40px 40px 32px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: '0 0 16px' }
const infoBox = { backgroundColor: '#eff6ff', borderRadius: '10px', padding: '16px 20px', margin: '16px 0', border: '1px solid #bfdbfe' }
const infoText = { fontSize: '14px', color: '#1e40af', margin: '0', lineHeight: '1.6' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#3CB371', color: '#ffffff', fontSize: '16px', fontWeight: '600' as const, borderRadius: '10px', padding: '14px 36px', textDecoration: 'none', display: 'inline-block' }
const footer = { padding: '0 40px 32px' }
const hr = { borderColor: '#e5e7eb', margin: '0 0 24px' }
const footerBrand = { fontSize: '14px', fontWeight: '600' as const, color: '#374151', margin: '0 0 4px', textAlign: 'center' as const }
const footerText = { fontSize: '12px', color: '#9ca3af', margin: '0 0 4px', textAlign: 'center' as const }
const footerLink = { color: '#3CB371', textDecoration: 'underline' }
const bold = { fontWeight: '700' as const }

/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Vertex Global Markets'

interface AdminNewDepositProps {
  userName?: string
  userEmail?: string
  amount?: string
  method?: string
  currency?: string
  submittedAt?: string
}

const AdminNewDepositEmail = ({
  userName = 'A user',
  userEmail = '',
  amount = '0.00',
  method = 'Crypto',
  currency = 'USD',
  submittedAt = new Date().toISOString(),
}: AdminNewDepositProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New deposit request: ${amount} from {userName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Deposit Request</Heading>
        <Text style={text}>
          A new deposit has been submitted and requires your review.
        </Text>
        <Section style={detailsBox}>
          <Text style={detailRow}><strong>User:</strong> {userName} ({userEmail})</Text>
          <Text style={detailRow}><strong>Amount:</strong> ${amount}</Text>
          <Text style={detailRow}><strong>Method:</strong> {method}</Text>
          <Text style={detailRow}><strong>Currency:</strong> {currency}</Text>
          <Text style={detailRow}><strong>Submitted:</strong> {new Date(submittedAt).toLocaleString()}</Text>
        </Section>
        <Text style={text}>
          Please log in to the admin dashboard to review and process this deposit.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          {SITE_NAME} — Admin Notification
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNewDepositEmail,
  subject: (data: Record<string, any>) => `New Deposit: $${data.amount || '0'} from ${data.userName || 'a user'}`,
  displayName: 'Admin: New Deposit Notification',
  previewData: {
    userName: 'John Doe',
    userEmail: 'john@example.com',
    amount: '1,000.00',
    method: 'BTC',
    currency: 'BTC',
    submittedAt: new Date().toISOString(),
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#111827', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const detailsBox = { backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px 20px', margin: '0 0 20px', border: '1px solid #e5e7eb' }
const detailRow = { fontSize: '14px', color: '#374151', lineHeight: '1.8', margin: '0' }
const hr = { borderColor: '#e5e7eb', margin: '30px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }

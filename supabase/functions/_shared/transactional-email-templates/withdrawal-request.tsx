import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Vertex Global Markets'

interface Props { name?: string; amount?: string; method?: string }

const WithdrawalRequestEmail = ({ name, amount, method }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Withdrawal request submitted — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Withdrawal Request Submitted</Heading>
        <Text style={text}>{name ? `Hello ${name},` : 'Hello,'}</Text>
        <Text style={text}>
          Your withdrawal request{amount ? ` of $${amount}` : ''}{method ? ` via ${method}` : ''} has been submitted and is pending review.
          We will notify you once the request has been processed.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>— {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WithdrawalRequestEmail,
  subject: 'Withdrawal Request Submitted',
  displayName: 'Withdrawal request',
  previewData: { name: 'John', amount: '500', method: 'USDT (TRC20)' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#111827', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '30px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }

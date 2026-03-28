import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Vertex Global Markets'

interface Props { name?: string; amount?: string; method?: string }

const DepositConfirmationEmail = ({ name, amount, method }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Deposit request received — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Deposit Request Received</Heading>
        <Text style={text}>{name ? `Hello ${name},` : 'Hello,'}</Text>
        <Text style={text}>
          Your deposit request{amount ? ` of $${amount}` : ''}{method ? ` via ${method}` : ''} has been submitted and is being reviewed.
          You will be notified once it is processed.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>— {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: DepositConfirmationEmail,
  subject: 'Deposit Request Received',
  displayName: 'Deposit confirmation',
  previewData: { name: 'John', amount: '1,000', method: 'BTC' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#111827', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '30px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }

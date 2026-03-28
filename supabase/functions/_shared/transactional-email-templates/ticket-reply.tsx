import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Vertex Global Markets'
const SITE_URL = 'https://vertexglobalmarkets.com'

interface Props { name?: string; subject?: string }

const TicketReplyEmail = ({ name, subject }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New reply to your support ticket — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Reply to Your Support Ticket</Heading>
        <Text style={text}>{name ? `Hello ${name},` : 'Hello,'}</Text>
        <Text style={text}>
          Our support team has replied to your ticket{subject ? `: "${subject}"` : ''}. Please check your dashboard for details.
        </Text>
        <Button style={button} href={`${SITE_URL}/dashboard/contact`}>
          View Ticket
        </Button>
        <Hr style={hr} />
        <Text style={footer}>— {SITE_NAME} Support Team</Text>
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

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#111827', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const button = { backgroundColor: 'hsl(145, 60%, 45%)', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600' as const, fontSize: '14px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e7eb', margin: '30px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }

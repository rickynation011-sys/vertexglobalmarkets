import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Vertex Global Markets'
const SITE_URL = 'https://vertexglobalmarkets.com'

interface Props { name?: string }

const FeeRejectedEmail = ({ name }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Fee payment update — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Fee Payment Could Not Be Verified</Heading>
        <Text style={text}>{name ? `Hello ${name},` : 'Hello,'}</Text>
        <Text style={text}>
          Your processing fee payment could not be verified. Please resubmit valid proof of payment to proceed with your withdrawal.
        </Text>
        <Button style={button} href={`${SITE_URL}/dashboard/fee-payment`}>
          Resubmit Proof
        </Button>
        <Hr style={hr} />
        <Text style={footer}>— {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FeeRejectedEmail,
  subject: 'Fee Payment Update — Action Required',
  displayName: 'Fee payment rejected',
  previewData: { name: 'John' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#111827', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const button = { backgroundColor: 'hsl(145, 60%, 45%)', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600' as const, fontSize: '14px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e7eb', margin: '30px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }

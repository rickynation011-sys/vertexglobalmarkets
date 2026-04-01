import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Vertex Global Markets'
const SITE_URL = 'https://vertexglobalmarkets.com'
const LOGO_URL = 'https://skzkshigufdtvcekfsqs.supabase.co/storage/v1/object/public/email-assets/logo-symbol.png'
const SUPPORT_EMAIL = 'support@vertexglobalmarkets.com'

interface Props { name?: string; bonusAmount?: string; referredUser?: string }

const ReferralBonusEmail = ({ name, bonusAmount, referredUser }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You earned a referral bonus — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={wrapper}>
        <Section style={header}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="48" height="48" style={logo} />
          <Text style={brandName}><span style={{ color: '#3CB371' }}>Vertex</span>{' '}<span style={{ color: '#4A90D9' }}>Global</span>{' '}<span style={{ color: '#8B5CF6' }}>Markets</span></Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>Referral Bonus Credited 🎁</Heading>
          <Text style={text}>{name ? `Hello ${name},` : 'Hello,'}</Text>
          <Text style={text}>
            Congratulations! {referredUser ? <>Your referral <span style={bold}>{referredUser}</span> has completed a qualifying action, and y</> : 'Y'}our referral bonus has been credited to your wallet.
          </Text>
          {bonusAmount && (
            <Section style={infoBox}>
              <Text style={infoText}>💵 Bonus Amount: <span style={bold}>${bonusAmount}</span></Text>
            </Section>
          )}
          <Text style={text}>
            Keep sharing your referral code to earn more rewards!
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${SITE_URL}/dashboard/referrals`}>View Referrals</Button>
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
  component: ReferralBonusEmail,
  subject: 'You Earned a Referral Bonus!',
  displayName: 'Referral bonus credited',
  previewData: { name: 'John', bonusAmount: '25', referredUser: 'Jane Doe' },
} satisfies TemplateEntry

const main = { backgroundColor: '#f4f4f5', fontFamily: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif", padding: '20px 0' }
const wrapper = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' as const, border: '1px solid #e5e7eb' }
const header = { backgroundColor: '#0f172a', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0 auto 12px', borderRadius: '8px' }
const brandName = { fontSize: '20px', fontWeight: '700' as const, margin: '0', letterSpacing: '0.5px' }
const body = { padding: '40px 40px 32px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: '0 0 16px' }
const infoBox = { backgroundColor: '#f0fdf4', borderRadius: '10px', padding: '16px 20px', margin: '16px 0', border: '1px solid #bbf7d0' }
const infoText = { fontSize: '14px', color: '#166534', margin: '0', lineHeight: '1.6' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#3CB371', color: '#ffffff', fontSize: '16px', fontWeight: '600' as const, borderRadius: '10px', padding: '14px 36px', textDecoration: 'none', display: 'inline-block' }
const footer = { padding: '0 40px 32px' }
const hr = { borderColor: '#e5e7eb', margin: '0 0 24px' }
const footerBrand = { fontSize: '14px', fontWeight: '600' as const, color: '#374151', margin: '0 0 4px', textAlign: 'center' as const }
const footerText = { fontSize: '12px', color: '#9ca3af', margin: '0 0 4px', textAlign: 'center' as const }
const footerLink = { color: '#3CB371', textDecoration: 'underline' }
const bold = { fontWeight: '700' as const }

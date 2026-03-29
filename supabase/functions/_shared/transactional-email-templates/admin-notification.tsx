/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Html, Head, Body, Container, Section, Text, Hr, Img,
} from 'npm:@react-email/components@0.0.22'

interface Props {
  title?: string
  message?: string
  recipientName?: string
}

const brandGreen = '#3CB371'

const AdminNotificationEmail = ({
  title = 'New Notification',
  message = 'You have a new notification from Vertex Global Markets.',
  recipientName = 'Valued Client',
}: Props) => (
  <Html>
    <Head />
    <Body style={{ margin: 0, padding: 0, backgroundColor: '#f4f4f5', fontFamily: 'Arial, sans-serif' }}>
      <Container style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <Section style={{ backgroundColor: '#0f172a', padding: '28px 32px', textAlign: 'center' as const }}>
          <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 700, margin: 0 }}>
            Vertex Global Markets
          </Text>
        </Section>

        {/* Body */}
        <Section style={{ backgroundColor: '#ffffff', padding: '32px' }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
            Hello {recipientName},
          </Text>
          <Text style={{ fontSize: 14, color: '#334155', lineHeight: '22px', whiteSpace: 'pre-wrap' as const }}>
            {message}
          </Text>
          <Hr style={{ borderColor: '#e2e8f0', margin: '24px 0' }} />
          <Text style={{ fontSize: 12, color: '#94a3b8' }}>
            This notification was sent by the Vertex Global Markets team. If you believe this was sent in error, please contact our support team.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={{ padding: '20px 32px', textAlign: 'center' as const }}>
          <Text style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
            © {new Date().getFullYear()} Vertex Global Markets. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNotificationEmail,
  subject: (data: Record<string, any>) => data.title || 'New Notification — Vertex Global Markets',
  displayName: 'Admin Notification',
  previewData: {
    title: 'Important Update',
    message: 'We have an important update regarding your account.',
    recipientName: 'John Doe',
  },
}

export default AdminNotificationEmail

/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as welcome } from './welcome.tsx'
import { template as depositConfirmation } from './deposit-confirmation.tsx'
import { template as depositApproved } from './deposit-approved.tsx'
import { template as withdrawalRequest } from './withdrawal-request.tsx'
import { template as withdrawalApproved } from './withdrawal-approved.tsx'
import { template as withdrawalRejected } from './withdrawal-rejected.tsx'
import { template as investmentConfirmation } from './investment-confirmation.tsx'
import { template as feeApproved } from './fee-approved.tsx'
import { template as feeRejected } from './fee-rejected.tsx'
import { template as ticketReply } from './ticket-reply.tsx'
import { template as kycApproved } from './kyc-approved.tsx'
import { template as kycRejected } from './kyc-rejected.tsx'
import { template as adminNewDeposit } from './admin-new-deposit.tsx'
import { template as adminNewWithdrawal } from './admin-new-withdrawal.tsx'
import { template as adminNewRegistration } from './admin-new-registration.tsx'
import { template as adminNewKyc } from './admin-new-kyc.tsx'
import { template as adminNewTicket } from './admin-new-ticket.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'deposit-confirmation': depositConfirmation,
  'deposit-approved': depositApproved,
  'withdrawal-request': withdrawalRequest,
  'withdrawal-approved': withdrawalApproved,
  'withdrawal-rejected': withdrawalRejected,
  'investment-confirmation': investmentConfirmation,
  'fee-approved': feeApproved,
  'fee-rejected': feeRejected,
  'ticket-reply': ticketReply,
  'kyc-approved': kycApproved,
  'kyc-rejected': kycRejected,
  'admin-new-deposit': adminNewDeposit,
  'admin-new-withdrawal': adminNewWithdrawal,
  'admin-new-registration': adminNewRegistration,
  'admin-new-kyc': adminNewKyc,
  'admin-new-ticket': adminNewTicket,
}

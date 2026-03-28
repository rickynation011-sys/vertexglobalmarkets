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
import { template as withdrawalRequest } from './withdrawal-request.tsx'
import { template as withdrawalApproved } from './withdrawal-approved.tsx'
import { template as withdrawalRejected } from './withdrawal-rejected.tsx'
import { template as investmentConfirmation } from './investment-confirmation.tsx'
import { template as feeApproved } from './fee-approved.tsx'
import { template as feeRejected } from './fee-rejected.tsx'
import { template as ticketReply } from './ticket-reply.tsx'
import { template as adminNewDeposit } from './admin-new-deposit.tsx'
import { template as adminNewWithdrawal } from './admin-new-withdrawal.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'deposit-confirmation': depositConfirmation,
  'withdrawal-request': withdrawalRequest,
  'withdrawal-approved': withdrawalApproved,
  'withdrawal-rejected': withdrawalRejected,
  'investment-confirmation': investmentConfirmation,
  'fee-approved': feeApproved,
  'fee-rejected': feeRejected,
  'ticket-reply': ticketReply,
  'admin-new-deposit': adminNewDeposit,
  'admin-new-withdrawal': adminNewWithdrawal,
}

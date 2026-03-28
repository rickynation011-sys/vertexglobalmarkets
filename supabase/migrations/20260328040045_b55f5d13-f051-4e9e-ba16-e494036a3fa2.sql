
-- Create ticket_messages table for chat threads
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'user',
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages on their own tickets
CREATE POLICY "Users can view own ticket messages" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = ticket_messages.ticket_id
    AND support_tickets.user_id = auth.uid()
  ));

-- Users can insert messages on their own tickets
CREATE POLICY "Users can send messages on own tickets" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    sender_type = 'user' AND
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Admins can view all ticket messages
CREATE POLICY "Admins can view all ticket messages" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert messages on any ticket
CREATE POLICY "Admins can send messages on any ticket" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND sender_type = 'admin'
  );

-- Add unread_count to support_tickets
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS unread_count INTEGER NOT NULL DEFAULT 0;

-- Add last_message_at for sorting
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable realtime for ticket_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

-- Enable realtime for support_tickets (for status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;

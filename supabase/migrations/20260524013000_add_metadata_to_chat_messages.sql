-- Migration: Add metadata to chat_messages
ALTER TABLE public.chat_messages
ADD COLUMN metadata JSONB DEFAULT NULL;

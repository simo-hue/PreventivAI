-- Aggiunge le opzioni di visualizzazione lato cliente, separate per ore e tariffa
ALTER TABLE public.quote_scenarios 
ADD COLUMN display_options JSONB NOT NULL DEFAULT '{"showHours": true, "showHourlyRate": true}'::jsonb;

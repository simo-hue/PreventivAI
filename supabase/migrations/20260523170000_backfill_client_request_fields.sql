-- Migration: Backfill null fields in client_requests from AI analysis stored in quote_runs.llm_raw_response
-- This fixes existing rows where normalized_text, client_budget_eur, client_deadline, client_timeline_text
-- were never populated because the code didn't write them back after AI analysis.

-- 1. Backfill normalized_text (= summary from AI analysis)
UPDATE public.client_requests cr
SET normalized_text = (qr.llm_raw_response ->> 'summary')
FROM public.quote_runs qr
WHERE qr.client_request_id = cr.id
  AND cr.normalized_text IS NULL
  AND qr.llm_raw_response IS NOT NULL
  AND qr.llm_raw_response ->> 'summary' IS NOT NULL;

-- 2. Backfill client_budget_eur (= detectedBudgetEur from AI analysis)
UPDATE public.client_requests cr
SET client_budget_eur = (qr.llm_raw_response ->> 'detectedBudgetEur')::numeric(12,2)
FROM public.quote_runs qr
WHERE qr.client_request_id = cr.id
  AND cr.client_budget_eur IS NULL
  AND qr.llm_raw_response IS NOT NULL
  AND qr.llm_raw_response ->> 'detectedBudgetEur' IS NOT NULL
  AND qr.llm_raw_response ->> 'detectedBudgetEur' != 'null';

-- 3. Backfill client_timeline_text (= detectedTimelineText from AI analysis)
UPDATE public.client_requests cr
SET client_timeline_text = (qr.llm_raw_response ->> 'detectedTimelineText')
FROM public.quote_runs qr
WHERE qr.client_request_id = cr.id
  AND cr.client_timeline_text IS NULL
  AND qr.llm_raw_response IS NOT NULL
  AND qr.llm_raw_response ->> 'detectedTimelineText' IS NOT NULL
  AND qr.llm_raw_response ->> 'detectedTimelineText' != 'null';

-- 4. Backfill client_deadline (= detectedDeadline from AI analysis)
-- Only for values that are valid ISO dates (YYYY-MM-DD)
UPDATE public.client_requests cr
SET client_deadline = (qr.llm_raw_response ->> 'detectedDeadline')::date
FROM public.quote_runs qr
WHERE qr.client_request_id = cr.id
  AND cr.client_deadline IS NULL
  AND qr.llm_raw_response IS NOT NULL
  AND qr.llm_raw_response ->> 'detectedDeadline' IS NOT NULL
  AND qr.llm_raw_response ->> 'detectedDeadline' != 'null'
  AND qr.llm_raw_response ->> 'detectedDeadline' ~ '^\d{4}-\d{2}-\d{2}$';

-- 4b. Backfill non-ISO detectedDeadline (e.g. "3 mesi") into client_timeline_text
UPDATE public.client_requests cr
SET client_timeline_text = COALESCE(cr.client_timeline_text || ' (deadline: ' || (qr.llm_raw_response ->> 'detectedDeadline') || ')', qr.llm_raw_response ->> 'detectedDeadline')
FROM public.quote_runs qr
WHERE qr.client_request_id = cr.id
  AND cr.client_deadline IS NULL
  AND cr.client_timeline_text IS NULL
  AND qr.llm_raw_response IS NOT NULL
  AND qr.llm_raw_response ->> 'detectedDeadline' IS NOT NULL
  AND qr.llm_raw_response ->> 'detectedDeadline' != 'null'
  AND qr.llm_raw_response ->> 'detectedDeadline' !~ '^\d{4}-\d{2}-\d{2}$';

-- 5. Update updated_at timestamp for all backfilled rows
UPDATE public.client_requests
SET updated_at = now()
WHERE normalized_text IS NOT NULL
  AND updated_at < now() - interval '1 second';

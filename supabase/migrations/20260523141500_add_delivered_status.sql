DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.client_requests'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.client_requests DROP CONSTRAINT ' || constraint_name;
    END IF;

    ALTER TABLE public.client_requests ADD CONSTRAINT client_requests_status_check CHECK (
        status in ('draft', 'transcribing', 'analyzing', 'needs_clarification', 'quoted', 'archived', 'error', 'delivered')
    );
END $$;

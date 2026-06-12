CREATE TABLE IF NOT EXISTS public.payout_requests (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    artist_name TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_details JSONB,
    status TEXT NOT NULL DEFAULT 'Pending',
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users handle their own payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Enable CRUD for users based on user_id" ON public.payout_requests;

CREATE POLICY "Enable CRUD for users based on user_id" ON public.payout_requests 
FOR ALL TO authenticated 
USING (
    auth.uid() = user_id 
    OR auth.jwt() ->> 'email' IN ('admin@g.g', 'wavoradashboard@gmail.com')
);

import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type ActiveRental = {
  id: string;
  bikeLabel: string;
  startTime: string;
  lat: number | null;
  lng: number | null;
  sidewalkId: string | null;
};

type SessionContextValue = {
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  activeRental: ActiveRental | null;
  refreshActiveRental: () => Promise<void>;
  hasAgreedToTerms: boolean;
  agreeToTerms: (agreed: boolean) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  isAdmin: false,
  isLoading: true,
  activeRental: null,
  refreshActiveRental: async () => {},
  hasAgreedToTerms: false,
  agreeToTerms: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [activeRental, setActiveRental] = useState<ActiveRental | null>(null);
  const [isRentalLoading, setIsRentalLoading] = useState(false);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsSessionLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setIsAdmin(false);
      setHasAgreedToTerms(false);
      setIsAdminLoading(false);
      return;
    }

    setIsAdminLoading(true);
    supabase
      .from('profiles')
      .select('is_admin, agreed_to_terms')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.is_admin ?? false);
        setHasAgreedToTerms(data?.agreed_to_terms ?? false);
        setIsAdminLoading(false);
      });
  }, [session?.user.id]);

  const agreeToTerms = useCallback(async (agreed: boolean) => {
    if (!session?.user) return;

    setHasAgreedToTerms(agreed);
    const { error } = await supabase
      .from('profiles')
      .update({ agreed_to_terms: agreed })
      .eq('id', session.user.id);

    if (error) setHasAgreedToTerms(!agreed);
  }, [session?.user]);

  const fetchActiveRental = useCallback(async (userId: string) => {
    setIsRentalLoading(true);
    const { data } = await supabase
      .from('rentals')
      .select('id, start_time, bicycles(bike_id, lat, lng, sidewalk_id)')
      .eq('user_id', userId)
      .is('end_time', null)
      .maybeSingle();

    const bicycle = data?.bicycles as any;
    const bikeId = bicycle?.bike_id;
    setActiveRental(data && bikeId != null ? {
      id: data.id,
      bikeLabel: `WPI${bikeId}`,
      startTime: data.start_time,
      lat: bicycle?.lat != null ? Number(bicycle.lat) : null,
      lng: bicycle?.lng != null ? Number(bicycle.lng) : null,
      sidewalkId: bicycle?.sidewalk_id ?? null,
    } : null);
    setIsRentalLoading(false);
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setActiveRental(null);
      setIsRentalLoading(false);
      return;
    }

    fetchActiveRental(session.user.id);
  }, [session?.user.id, fetchActiveRental]);

  const refreshActiveRental = useCallback(async () => {
    if (session?.user) await fetchActiveRental(session.user.id);
  }, [session?.user, fetchActiveRental]);

  const isLoading = isSessionLoading || isAdminLoading || isRentalLoading;

  return (
    <SessionContext.Provider value={{ session, isAdmin, isLoading, activeRental, refreshActiveRental, hasAgreedToTerms, agreeToTerms }}>
      {children}
    </SessionContext.Provider>
  );
}

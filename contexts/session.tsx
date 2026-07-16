import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SessionContextValue = {
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  isAdmin: false,
  isLoading: true,
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

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
      setIsAdminLoading(false);
      return;
    }

    setIsAdminLoading(true);
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.is_admin ?? false);
        setIsAdminLoading(false);
      });
  }, [session?.user.id]);

  const isLoading = isSessionLoading || isAdminLoading;

  return (
    <SessionContext.Provider value={{ session, isAdmin, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

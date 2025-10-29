import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  hasCompletedQuestionnaire: boolean;
  isLoading: boolean;
  refreshQuestionnaireStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkQuestionnaireStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('id')
        .eq('user_id', userId)
        .single();

      setHasCompletedQuestionnaire(!error && !!data);
    } catch (error) {
      setHasCompletedQuestionnaire(false);
    }
  };

  const refreshQuestionnaireStatus = async () => {
    if (user) {
      await checkQuestionnaireStatus(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check questionnaire status when user logs in
        if (session?.user) {
          setTimeout(() => {
            checkQuestionnaireStatus(session.user.id);
          }, 0);
        } else {
          setHasCompletedQuestionnaire(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkQuestionnaireStatus(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        hasCompletedQuestionnaire,
        isLoading,
        refreshQuestionnaireStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

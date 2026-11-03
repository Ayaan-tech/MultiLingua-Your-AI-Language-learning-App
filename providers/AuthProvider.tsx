import {PropsWithChildren, useState, useEffect} from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/utils/supabase"
import { AuthContext } from "@/ctx/AuthContext"
export default async function AuthProvider({children}: PropsWithChildren) {
    const [session , setSession] = useState<Session | null>(null)
    const [user , setUser] = useState<User | null>(null)
    const [profile , setProfile] = useState<any | null>(null)
    const [loading , setLoading] = useState(true)
    const premiumExpiresAt: Date | null = profile?.premium_expires_at
      ? new Date(profile.premium_expires_at)
      : null;
    const isPremium: boolean =
      !!profile?.is_premium && (!premiumExpiresAt || premiumExpiresAt > new Date());
    const loadProfile = async(s: Session | null) =>{
        if(!s){
            setProfile(null)
            return
        }
        const {error, data} = await supabase
            .from('profiles')
            .select("*")
            .eq("id",s.user.id)
            .maybeSingle()
        setProfile(error ?null : data)
    }
    const refreshProfile = () => loadProfile(session)



    useEffect(() => {
        const init = async () =>{
            setLoading(true)
            const {data} = await supabase.auth.getSession();
            const initialSession = data.session ?? null
            setSession(initialSession)
            await loadProfile(initialSession)
            setLoading(false)
        };
        init()
        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, newSession) =>{
            setLoading(true)
            setSession(newSession ?? null)
            loadProfile(newSession).finally(
                ()=>setLoading(false)
            )
        });
        return ()=>subscription.unsubscribe()
    }, [])
    return (
        <AuthContext.Provider value={{
            session,
            user: session?.user ?? null,
            profile,
            loading,
            isAdmin: false,
            isPremium,
            premiumExpiresAt,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}
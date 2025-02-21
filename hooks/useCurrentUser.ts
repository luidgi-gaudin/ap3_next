import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getUser } from "@/services/userService";
import utilisateurService from "@/services/utilisateurService";

interface CompleteUser {
    auth: User | null;
    profile: any | null;
    isLoading: boolean;
    error: Error | null;
}

export const useCurrentUser = () => {
    const [user, setUser] = useState<CompleteUser>({
        auth: null,
        profile: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Get Supabase authenticated user
                const authUser = await getUser();

                if (!authUser) {
                    setUser({ auth: null, profile: null, isLoading: false, error: null });
                    return;
                }

                // Get user profile from database
                const userProfile = await utilisateurService.getUtilisateurBySupabaseId(authUser.id);

                setUser({
                    auth: authUser,
                    profile: userProfile,
                    isLoading: false,
                    error: null,
                });
            } catch (error) {
                setUser({
                    auth: null,
                    profile: null,
                    isLoading: false,
                    error: error as Error,
                });
            }
        };

        fetchUser();
    }, []);

    return user;
};
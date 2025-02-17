import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

const supabase = createClient();

export const getUser = async (): Promise<User | null> => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return user;
};
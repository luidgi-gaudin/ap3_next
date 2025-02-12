import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import UtilisateurService from '@/services/utilisateurService';

export default async function Home() {
    const supabase = await createClient();
    const { data: session, error } = await supabase.auth.getUser();

    if (error || !session) {
        redirect('/login');
    }

    const user = await UtilisateurService.getUtilisateurBySupabaseId(session.user.id);

    if (!user) {
        redirect('/login');
    }

    switch (user.id_role) {
        case 1:
            redirect('/admin');
            break;
        case 2:
            redirect('/dashboard');
            break;
        default:
            redirect('/login');
    }

}

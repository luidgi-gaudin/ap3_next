import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import UtilisateurService from '@/services/utilisateurService';

export default async function Home() {
    const supabase = await createClient();
    const { data: session, error } = await supabase.auth.getUser();

    if (error || !session) {
        // Si l'utilisateur n'est pas authentifié, redirigez vers /login
        redirect('/login');
    }

    const user = await UtilisateurService.getUtilisateurBySupabaseId(session.user.id);

    if (!user) {
        // Si l'utilisateur n'est pas trouvé, redirigez vers /login
        redirect('/login');
    }

    // Redirigez en fonction du rôle de l'utilisateur
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

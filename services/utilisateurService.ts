import {prisma} from "@/lib/prisma";

class UtilisateurService {
    // Créer un utilisateur
    async CreateUtilisateur(donneesUtilisateur: {
        email: string;
        prenom: string;
        nom: string;
        supabase_id: string;
        id_role: number;
    }) {
        return prisma.utilisateur.create({
            data: donneesUtilisateur,
        });
    }


    async getUtilisateurBySupabaseId(supabase_id: string) {
        return prisma.utilisateur.findUnique({
            where: { supabase_id },
        });
    }

}

export default new UtilisateurService();
import {prisma} from "@/lib/prisma";

class UtilisateurService {
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
    async updateUtilisateurBySupabaseId(supabaseId: string, data: { prenom: string; nom: string }) {
        try {
            return await prisma.utilisateur.update({
                where: { supabase_id: supabaseId },
                data,
            });
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
            throw new Error("Impossible de mettre à jour l'utilisateur.");
        }
    }

}

export default new UtilisateurService();
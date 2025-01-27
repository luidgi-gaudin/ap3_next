import {prisma} from "@/lib/prisma";
import {Prisma} from "@prisma/client";

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

    // Obtenir un utilisateur par ID
    async getUtilisateurById(id: number) {
        return prisma.utilisateur.findUnique({
            where: {id},
        });
    }

    async getUtilisateurBySupabaseId(supabase_id: string) {
        return prisma.utilisateur.findUnique({
            where: { supabase_id },
        });
    }

    // Obtenir tous les utilisateurs
    async GetAllUtilisateur() {
        return prisma.utilisateur.findMany();
    }

    // Mettre à jour un utilisateur
    async UpdateUtilisateur(id: number, updates: Prisma.UtilisateurUpdateInput) {
        return prisma.utilisateur.update({
            where: {id},
            data: updates,
        });
    }

    // Supprimer un utilisateur
    async DeleteUtilisateur(id: number) {
        return prisma.utilisateur.delete({
            where: {id},
        });
    }
}

export default new UtilisateurService();
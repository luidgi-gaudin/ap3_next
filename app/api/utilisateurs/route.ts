import { NextResponse } from "next/server";
import UtilisateurService from "@/services/utilisateurService";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const supabase_id = searchParams.get("supabase_id");

        if (!supabase_id) {
            return NextResponse.json(
                { error: "Le paramètre 'supabase_id' est requis." },
                { status: 400 }
            );
        }

        const utilisateur = await UtilisateurService.getUtilisateurBySupabaseId(supabase_id);

        if (!utilisateur) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé." },
                { status: 404 }
            );
        }

        return NextResponse.json(utilisateur, { status: 200 });
    } catch (e) {
        console.error("Erreur lors de la récupération de l'utilisateur :", e);
        return NextResponse.json(
            { error: `Erreur serveur : ${e instanceof Error ? e.message : "Erreur inconnue"}` },
            { status: 500 }
        );
    }
}
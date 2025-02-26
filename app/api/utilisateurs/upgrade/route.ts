import { NextResponse } from "next/server";
import UtilisateurService from "@/services/utilisateurService";

export async function GET() {
    try {
        const utilisateurs = await UtilisateurService.getAllUtilisateurs();
        return NextResponse.json({ utilisateurs }, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            { error: `Erreur serveur : ${e instanceof Error ? e.message : "Erreur inconnue"}` },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { supabase_id, id_role } = body;

        if (!supabase_id || !id_role) {
            return NextResponse.json(
                { error: "supabase_id et id_role sont requis" },
                { status: 400 }
            );
        }

        const utilisateur = await UtilisateurService.updateUtilisateurRole(supabase_id, id_role);
        return NextResponse.json(utilisateur, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            { error: `Erreur serveur : ${e instanceof Error ? e.message : "Erreur inconnue"}` },
            { status: 500 }
        );
    }
}
import {NextResponse} from "next/server";
import RolesService from "@/services/rolesService";


export async function GET() {
    try {
        const roles = await RolesService.GetAllRoles();
        return NextResponse.json(roles, { status: 200 });
    } catch (e) {
        console.error("Erreur lors de la récupération des rôles :", e);
        return NextResponse.json(
            { error: `Failed to fetch roles: ${e instanceof Error ? e.message : String(e)}` },
            { status: 500 }
        );
    }
}
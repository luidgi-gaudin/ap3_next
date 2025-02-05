import { NextResponse } from "next/server";
import RolesService from "@/services/rolesService";

export async function GET() {
    try {
        const roles = await RolesService.GetAllRoles();
        return NextResponse.json({ roles: roles ?? [] }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération des rôles :", error);
        return NextResponse.json(
            { error: `Failed to fetch roles: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
}



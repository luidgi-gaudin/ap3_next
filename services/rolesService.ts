import { prisma } from "@/lib/prisma"

class RolesService {
    static async GetAllRoles() {
        try {
            const roles = await prisma.role.findMany();
            console.log("Rôles récupérés :", roles);
            return roles ?? [];
        } catch (error) {
            console.error("Erreur dans RolesService.GetAllRoles :", error);
            throw error;
        }
    }
}

export default RolesService;

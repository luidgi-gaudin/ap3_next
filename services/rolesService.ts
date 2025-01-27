import {prisma} from "@/lib/prisma";

class RolesService {
    async GetAllRoles() {
        try {
            const roles = await prisma.role.findMany();
            console.log("Rôles depuis la base Prisma :", roles);
            return roles;
        } catch (error) {
            throw new Error("Failed to fetch roles");
        }
    }
}

export default new RolesService();
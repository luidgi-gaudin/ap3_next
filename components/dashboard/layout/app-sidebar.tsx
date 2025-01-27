import * as React from "react"
import { NavUser } from "@/components/dashboard/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";
import UtilisateurService from "@/services/utilisateurService";
import {DashboardLinkButton} from "@/components/dashboard/layout/dashboardLinkButton";
import {NavigationButton} from "@/components/dashboard/layout/navigationButton";

import { Package, ClipboardList } from "lucide-react";

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login')
  }
    const utilisateur = await UtilisateurService.getUtilisateurBySupabaseId(data.user.id);
    const user = {
      name: utilisateur?.prenom + " " + utilisateur?.nom as string,
        email: data.user.email as string,
        avatar: utilisateur ? utilisateur.prenom.charAt(0).toUpperCase() + utilisateur.nom.charAt(0).toUpperCase() : "NN",
    }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <DashboardLinkButton/>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavigationButton
            path="/orders"
            label="Commandes"
            icon={<ClipboardList className="w-4 h-4" />}
        />
        <NavigationButton
            path="/stock"
            label="Stock"
            icon={<Package className="w-4 h-4" />}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

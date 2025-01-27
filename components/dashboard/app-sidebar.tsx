import * as React from "react"
import { NavUser } from "@/components/dashboard/nav-user"
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
import {DashboardLinkButton} from "@/components/dashboard/dashboardLinkButton";


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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

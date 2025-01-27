import * as React from "react"
import {
  Command,
} from "lucide-react"
import { NavUser } from "@/components/nav-user"
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
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
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

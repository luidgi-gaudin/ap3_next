"use client"
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQPage() {
  return (
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Foire Aux Questions (FAQ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">

            <AccordionItem value="orders-1">
              <AccordionTrigger>
                Comment créer et gérer les commandes ?
              </AccordionTrigger>
              <AccordionContent>
                Dans la section Commandes, vous pouvez créer une nouvelle commande en sélectionnant les produits et leurs quantités. Les commandes suivent un processus de statut (en attente, en préparation, etc.) et peuvent être modifiées tant qu&apos;elles sont en statut en attente.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="stock-2">
              <AccordionTrigger>
                Comment suivre les mouvements de stock ?
              </AccordionTrigger>
              <AccordionContent>
                Tous les mouvements de stock (entrées, sorties, ajustements) sont automatiquement enregistrés avec les détails de l&apos;utilisateur, la date et le type de mouvement. Vous pouvez consulter l&apos;historique des 10 derniers mouvements dans le tableau de bord.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account-1">
              <AccordionTrigger>
                Comment gérer mon compte utilisateur ?
              </AccordionTrigger>
              <AccordionContent>
                Dans la section Compte, vous pouvez modifier vos informations personnelles (nom, prénom). Votre rôle détermine vos permissions dans l&apos;application. Contactez un administrateur pour toute modification de droits d&apos;accès.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dashboard-1">
              <AccordionTrigger>
                Quelles informations sont disponibles sur le tableau de bord ?
              </AccordionTrigger>
              <AccordionContent>
                Le tableau de bord affiche une vue d&apos;ensemble de votre activité : répartition des stocks par type, historique des commandes sur 7 jours, derniers mouvements de stock et dernières commandes créées.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
  );
}
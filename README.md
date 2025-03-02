# Rapport Technique : Application de Gestion des Stocks et des Commandes pour GSB

---

### Introduction

Ce rapport détaille l’architecture, les fonctionnalités et les choix techniques d’une application web développée pour le laboratoire **Galaxy Swiss Bourdin (GSB)**, un leader pharmaceutique issu de la fusion entre Galaxy et Swiss Bourdin en 2009. Basée à Paris pour ses opérations européennes, GSB a besoin d’un outil performant pour gérer ses stocks de médicaments et de matériel, ainsi que les commandes internes, dans un secteur où la précision et la fiabilité sont cruciales. L’application s’adresse à deux types d’utilisateurs distincts :

- **Utilisateurs standards** : Personnel soignant ou administratif, qui consultent les stocks et passent des commandes.
- **Administrateurs** : Responsables de pharmacie ou gestionnaires de stock, qui valident les commandes et gèrent les quantités disponibles.

Conçue dans le cadre d’un projet de BTS SIO, cette application utilise des technologies modernes telles que **Next.js 15**, **Prisma**, **Supabase** et **Shadcn UI**, offrant une solution robuste, sécurisée et évolutive pour répondre aux besoins spécifiques de GSB.

---

### Contexte et Objectifs

Dans l’industrie pharmaceutique, marquée par des exigences strictes en matière de traçabilité et de gestion des ressources, GSB requiert une solution numérique pour optimiser ses processus internes. L’application vise à :

- Permettre une **consultation claire des stocks** pour tous les utilisateurs.
- Simplifier la **passation des commandes** par le personnel standard, avec un statut initial « en attente ».
- Offrir aux administrateurs des outils pour **gérer les commandes** (approbation ou rejet) et **mettre à jour les stocks**.
- Garantir une **interface accessible** et une **sécurité renforcée** pour protéger les données sensibles.

Ce projet s’inscrit dans un scénario réaliste où la gestion efficace des ressources est essentielle pour soutenir les opérations quotidiennes de GSB.

---

### Technologies et Structure

L’application adopte une approche full-stack avec des technologies soigneusement choisies pour leur performance et leur compatibilité :

#### Technologies Utilisées

- **Front-end** :
  - **Next.js 15** : Framework React offrant un rendu côté serveur (SSR) et une nouvelle structure d’application (`app directory`) pour une gestion optimisée des routes et des layouts.
  - **Shadcn UI** : Bibliothèque de composants accessibles et personnalisables, intégrée avec **Tailwind CSS** pour un design moderne et cohérent.
- **Back-end** :
  - **Prisma** : ORM (Object-Relational Mapping) pour interagir avec la base de données, garantissant une sécurité de type et des requêtes efficaces.
  - **Supabase** : Plateforme open-source fournissant une base de données PostgreSQL, avec des fonctionnalités intégrées comme l’authentification et les abonnements en temps réel (ici utilisée principalement pour l’authentification).
- **Autres outils** :
  - **Tailwind CSS** : Framework utilitaire pour un style rapide et responsive.
  - **TypeScript** : Ajoute une sécurité de type au code, essentielle pour un projet professionnel.

#### Structure du Projet

L’arborescence du projet est organisée de manière claire et modulaire :

- **`app/`** : Contient les routes principales, comme `app/(app)/login/page.tsx` pour la connexion et `app/(dashboard)/stock/page.tsx` pour la consultation des stocks.
- **`components/`** : Regroupe les éléments d’interface réutilisables, tels que `AccountForm.tsx` ou `Logo.tsx`, utilisant Shadcn UI.
- **`services/`** : Héberge la logique métier, avec des fichiers comme `stockService.ts` et `ordersService.ts`.
- **`utils/`** : Inclut des utilitaires, comme `supabase/client.ts` et `server.ts`, pour gérer l’authentification avec Supabase.
- **`lib/`** : Contient la configuration de Prisma (`lib/prisma.ts`) pour les interactions avec la base de données.

---

### Fonctionnalités Clés

L’application propose un ensemble de fonctionnalités répondant aux besoins des utilisateurs de GSB :

1. **Consultation des Stocks** :

   - Accessible à tous les utilisateurs via `app/(dashboard)/stock/page.tsx`.
   - Affiche une liste des stocks (médicaments et matériel) avec des détails comme le nom, la description et la quantité disponible.

2. **Passation de Commandes** :

   - Réservée aux utilisateurs standards via `app/(dashboard)/orders/create/page.tsx`.
   - Les commandes sont créées avec un statut « en attente » pour validation administrative.

3. **Gestion des Commandes** :

   - Les administrateurs peuvent consulter, approuver ou rejeter les commandes via des services comme `stockService.ts`.
   - Une approbation met à jour les quantités de stock en conséquence.

4. **Ajout de Stock** :
   - Fonctionnalité exclusive aux administrateurs pour enregistrer de nouvelles entrées de stock, augmentant les quantités disponibles.

#### Exemple de Code : Consultation des Stocks

Voici un extrait de `app/(dashboard)/stock/page.tsx` pour illustrer la récupération et l’affichage des stocks :

```tsx
"use client";
import { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Stock {
	id_stock: number;
	nom: string;
	description: string;
	quantite_disponible: number;
	TypeStock: { nom_type: string };
}

export default function StockPage() {
	const [stocks, setStocks] = useState<Stock[]>([]);
	const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");

	useEffect(() => {
		fetchStocks();
	}, []);

	const fetchStocks = async () => {
		const response = await fetch("/api/stocks");
		const json = await response.json();
		setStocks(json.stocks);
		setFilteredStocks(json.stocks);
	};

	useEffect(() => {
		const results = stocks.filter(
			(stock) =>
				stock.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
				stock.description.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredStocks(results);
	}, [searchTerm, stocks]);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-4">Stock</h1>
			<Input
				type="text"
				placeholder="Rechercher un stock..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="mb-4"
			/>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nom</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Type de stock</TableHead>
						<TableHead>Quantité disponible</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredStocks.map((stock) => (
						<TableRow key={stock.id_stock}>
							<TableCell>{stock.nom}</TableCell>
							<TableCell>{stock.description}</TableCell>
							<TableCell>{stock.TypeStock.nom_type}</TableCell>
							<TableCell>{stock.quantite_disponible}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
```

Cet exemple montre une page client-side avec Next.js, récupérant les données via une API et les affichant dans un tableau filtrable avec Shadcn UI.

---

### Sécurité et Accessibilité

La sécurité et l’accessibilité sont des priorités pour garantir un usage fiable et inclusif :

#### Authentification

- **Mécanisme** : Gérée par Supabase, avec des fichiers comme `utils/supabase/client.ts` (côté client) et `server.ts` (côté serveur) pour configurer les interactions.
- **Processus** : Les utilisateurs se connectent via `app/(app)/login/page.tsx`, recevant un token JWT pour sécuriser leur session.

#### Autorisation

- **Rôles Utilisateur** : Deux rôles sont définis (standard et admin), stockés dans la table `Role` et liés aux utilisateurs via `id_role`.
- **Protection des Routes** : Le fichier `middleware.ts` vérifie les rôles avant d’autoriser l’accès à des routes sensibles, comme celles réservées aux administrateurs.

#### Exemple de Code : Middleware

Voici un extrait de `middleware.ts` pour protéger les routes administratives :

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						request.cookies.set(name, value)
					);
				},
			},
		}
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (
		!user &&
		!request.nextUrl.pathname.startsWith("/login") &&
		!request.nextUrl.pathname.startsWith("/auth")
	) {
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}
```

Ce code redirige les utilisateurs non authentifiés vers la page de connexion.

#### Accessibilité

- **Shadcn UI** : Fournit des composants conformes aux standards WCAG, assurant une interface utilisable par tous, y compris les personnes en situation de handicap.
- **Exemple** : Les formulaires (comme celui de connexion) incluent des labels et des attributs ARIA pour une navigation au clavier et avec des lecteurs d’écran.

---

### Conception de la Base de Données

La base de données PostgreSQL, hébergée sur Supabase, est structurée pour gérer efficacement les stocks et les commandes. Voici le schéma détaillé :

| **Tableau**         | **Champs Principaux**                                                                                       | **Description**                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Role**            | `id_role`, `nom_role`                                                                                       | Définit les rôles (ex. "standard", "admin").                        |
| **Utilisateur**     | `id_utilisateur`, `nom`, `prenom`, `email`, `id_role`, `supabase_id`                                        | Informations des utilisateurs, liées à leur rôle et à Supabase.     |
| **Stock**           | `id_stock`, `nom`, `description`, `quantite_disponible`, `id_type_stock`                                    | Gère les stocks avec quantité et type (médicaments/matériel).       |
| **Commande**        | `id_commande`, `id_utilisateur`, `date_commande`, `id_statut`                                               | Enregistre les commandes, liées à un utilisateur et un statut.      |
| **DetailsCommande** | `id_commande`, `id_stock`, `quantite`                                                                       | Détaille les éléments d’une commande (quantité demandée par stock). |
| **Mouvement**       | `id_mouvement`, `id_stock`, `type_mouvement`, `quantite`, `date_mouvement`, `id_utilisateur`, `id_commande` | Suit les mouvements de stock (entrées/sorties).                     |
| **TypeStock**       | `id`, `nom_type`                                                                                            | Catégorise les stocks (ex. "médicaments", "matériel").              |
| **statut_commande** | `id`, `name`                                                                                                | Définit les statuts (ex. "en attente", "approuvée", "rejetée").     |

### Front-end : Interface Utilisateur

Le front-end est organisé avec la nouvelle `app directory` de Next.js :

- **Pages Principales** :
  - `app/(app)/login/page.tsx` : Page de connexion avec un formulaire simple.
  - `app/(dashboard)/layout.tsx` : Layout du tableau de bord avec une navigation latérale.
  - `app/(dashboard)/stock/page.tsx` : Consultation des stocks.
  - `app/(dashboard)/orders/create/page.tsx` : Création de commandes.
- **Composants** : Réutilisables dans `components/`, comme `AccountForm.tsx` pour les formulaires utilisateur.

#### Description Visuelle

- **Page de Connexion** : Formulaire avec champs email et mot de passe, stylisé avec Tailwind CSS et Shadcn UI.
- **Tableau de Bord** : Barre latérale pour naviguer entre stocks, commandes et profil, avec un contenu principal adaptatif.

**Insérez ici la capture d’écran de la page de connexion.**

---

### Back-end : Logique Serveur

Le back-end utilise des API routes Next.js et des services pour gérer la logique métier :

- **Services** : `stockService.ts` et `ordersService.ts` contiennent des fonctions comme la mise à jour des stocks ou l’approbation des commandes.
- **Prisma** : Interface avec la base de données via `lib/prisma.ts`.

#### Exemple de Code : Mise à jour de la quantité de stock

Voici un extrait de `stockService.ts` pour la mise à jour de la quantité :

```ts
export async function updateStockQuantity(
	stockId: number,
	quantityToAdd: number,
	supabaseUserId: string
) {
	try {
		const utilisateur = await utilisateurService.getUtilisateurBySupabaseId(
			supabaseUserId
		);
		if (!utilisateur) {
			throw new Error("Utilisateur non trouvé");
		}

		return await prisma.$transaction(async (tx) => {
			const stock = await tx.stock.findUnique({
				where: { id_stock: stockId },
			});

			if (!stock) {
				throw new Error("Stock non trouvé");
			}

			const updatedStock = await tx.stock.update({
				where: { id_stock: stockId },
				data: {
					quantite_disponible: stock.quantite_disponible + quantityToAdd,
				},
				include: { TypeStock: true },
			});

			await tx.mouvement.create({
				data: {
					id_stock: stockId,
					type_mouvement: quantityToAdd > 0 ? "ajout manuel" : "retrait manuel",
					quantite: Math.abs(quantityToAdd),
					id_utilisateur: utilisateur.id_utilisateur,
				},
			});

			return updatedStock;
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du stock :", error);
		throw error;
	}
}
```

Cet exemple montre l’utilisation d’une transaction Prisma pour mettre à jour la quantité de stock et enregistrer un mouvement correspondant.

---

### Consultation des Stocks (`app/(dashboard)/stock/page.tsx`)

#### Description

Cette page permet aux utilisateurs de consulter la liste des stocks disponibles. Elle inclut un champ de recherche pour filtrer les stocks par nom ou description, et pour les administrateurs, des options pour ajouter ou supprimer des stocks.

**Insérez ici la capture d’écran de la page de consultation des stocks.**

---

### Passation de Commandes (`app/(dashboard)/orders/create/page.tsx`)

#### Description

Cette page permet aux utilisateurs de créer de nouvelles commandes en sélectionnant des produits, en spécifiant des quantités, et en les ajoutant à un panier avant de soumettre la commande.

**Insérez ici la capture d’écran de la page de création de commande.**

---

### Conclusion et Perspectives

L’application intègre efficacement Next.js, Prisma, Supabase et Shadcn UI pour répondre aux besoins de GSB. Elle offre une gestion fluide des stocks et des commandes, une interface accessible et une sécurité robuste grâce à l’authentification et à l’autorisation basées sur les rôles.

#### Perspectives Futures

- Ajouter des mises à jour en temps réel avec les abonnements Supabase.
- Intégrer des analyses avancées pour suivre les tendances des stocks.
- Connecter l’application à des API externes pour automatiser les approvisionnements.

---

### Documentation et Ressources Utiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI Installation](https://ui.shadcn.com/docs/installation)
- [Prisma ORM Documentation](https://www.prisma.io/docs/orm/overview)
- [Supabase Database Guide](https://supabase.com/docs/guides/database/overview)

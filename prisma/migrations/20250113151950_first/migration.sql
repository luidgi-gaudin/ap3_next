-- CreateTable
CREATE TABLE "Role" (
    "id_role" SERIAL NOT NULL,
    "nom_role" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id_utilisateur" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "id_role" INTEGER NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id_stock" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantite_disponible" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'medicament',

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id_stock")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id_commande" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "date_commande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id_commande")
);

-- CreateTable
CREATE TABLE "DetailsCommande" (
    "id_commande" INTEGER NOT NULL,
    "id_stock" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "DetailsCommande_pkey" PRIMARY KEY ("id_commande","id_stock")
);

-- CreateTable
CREATE TABLE "Mouvement" (
    "id_mouvement" SERIAL NOT NULL,
    "id_stock" INTEGER NOT NULL,
    "type_mouvement" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "date_mouvement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_commande" INTEGER NOT NULL,

    CONSTRAINT "Mouvement_pkey" PRIMARY KEY ("id_mouvement")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_nom_role_key" ON "Role"("nom_role");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "Role"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailsCommande" ADD CONSTRAINT "DetailsCommande_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "Commande"("id_commande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailsCommande" ADD CONSTRAINT "DetailsCommande_id_stock_fkey" FOREIGN KEY ("id_stock") REFERENCES "Stock"("id_stock") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mouvement" ADD CONSTRAINT "Mouvement_id_stock_fkey" FOREIGN KEY ("id_stock") REFERENCES "Stock"("id_stock") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mouvement" ADD CONSTRAINT "Mouvement_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "Commande"("id_commande") ON DELETE RESTRICT ON UPDATE CASCADE;

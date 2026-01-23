import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import "./index.css";
import Transactions from "./routes/transactions";
import Deconnexion from "./routes/deconnexion";
import Connexion from "./routes/connexion";
import HomePage from "./routes/app";



import { MotDePasse } from "./routes/mot_de_passe";
import { Profil } from "./routes/profil";

import '@radix-ui/themes/styles.css';
import { Theme } from "@radix-ui/themes";

import ProtectedRoute from "./lib/auth";
import Dossiers from "./routes/dossiers";
import Archives from "./routes/archives";
import { DetailsArchive } from "./routes/details_archive";
import { DetailsDossier } from "./routes/details_dossier";
import GestionUtilisateurs from "./routes/utilisateurs";
import GestionGroupes from "./routes/groupes";
import GestionTypes from "./routes/types";
import GestionUtilisateursSuperAdmin from "./routes/utilisateurs-admin";
import Produits from "./routes/produits";
import Clients from "./routes/clients";
import NotesDeFrais from "./routes/note_frais";
import Devis from "./routes/devis";
import Factures from "./routes/factures";
import Dashboard from "./routes/dashboard";



const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    children: [
      {
        path: "/",
        element: <ProtectedRoute component={Dashboard} />,
      },
      {
        path: "/transactions",
        element: <ProtectedRoute component={Transactions} />,
      },
      {
        path: "/produits",
        element: <ProtectedRoute component={Produits} />,
      },
      {
        path: "/clients",
        element: <ProtectedRoute component={Clients} />,
      },
      {
        path: "/notes_frais",
        element: <ProtectedRoute component={NotesDeFrais} />,
      },
      {
        path: "/devis",
        element: <ProtectedRoute component={Devis} />,
      },
      {
        path: "/factures",
        element: <ProtectedRoute component={Factures} />,
      },
      {
        path: "/dossiers",
        element: <ProtectedRoute component={Dossiers} />,
      },
      {
        path: "/groupes",
        element: <ProtectedRoute component={GestionGroupes} />,
      },
      {
        path: "/types",
        element: <ProtectedRoute component={GestionTypes} />,
      },
      {
        path: "/archives",
        element: <ProtectedRoute component={Archives} />,
      },
      {
        path: "/dossiers/details/:id",
        element: <ProtectedRoute component={DetailsDossier} />,
      },
      {
        path: "/archives/details/:id",
        element: <ProtectedRoute component={DetailsArchive} />,
      },
      {
        path: "/utilisateurs/",
        element: <ProtectedRoute component={GestionUtilisateurs} />,
      },
      {
        path: "/utilisateurs-admin/",
        element: <ProtectedRoute component={GestionUtilisateursSuperAdmin} />,
      },
     
      {
        path: "/mot_de_passe",
        element: <ProtectedRoute component={MotDePasse} />,
      },
      {
        path: "/profil",
        element: <ProtectedRoute component={Profil} />,
      },
      {
        path: "/deconnexion",
        element: <Deconnexion />,
      },
    ],
  },
  { path: "/connexion", element: <Connexion /> },
]);

const lang = window.localStorage.getItem("lang");

if(lang){
  i18n.changeLanguage(lang)
}
else {
  window.localStorage.setItem('lang', i18n.language)
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <div
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
        className={"mainElement " +(i18n.language == "ar" ? "font-arabic" : "font-fr")}
      >
        <Theme>
          <RouterProvider router={router} />
        </Theme>
        
      </div>
    </I18nextProvider>
  </React.StrictMode>
);

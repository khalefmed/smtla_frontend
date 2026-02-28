import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}



export const ETAPES_DOSSIER = {
  consultation: "Consultation",
  numerisation: "Numérisation",
  validation: "Validation",
  archive_temporaire: "Archive temporaire",
  archive_physique: "Archive physique",
  archive_final: "Archive final",
  archive_finale: "Archive finale",
};




/**
 * Vérifie si l'utilisateur possède un rôle spécifique dans n'importe quel groupe.
 * @param {string} roleCherche - Le nom du rôle à vérifier (ex: 'admin')
 * @returns {boolean} - true si le rôle est trouvé, sinon false
 */
export const aLeRole = (roleCherche) => {
  const groupesData = localStorage.getItem("groupes_info");

  // Si aucune donnée n'est trouvée, l'utilisateur n'a aucun rôle
  if (!groupesData) return false;

  try {
    const groupes = JSON.parse(groupesData);

    // .some() renvoie true si au moins un élément du tableau respecte la condition
    return groupes.some(groupe => 
      groupe.roles && groupe.roles.includes(roleCherche)
    );
  } catch (error) {
    console.error("Erreur lors de la lecture des rôles :", error);
    return false;
  }
};

/**
 * Optionnel : Vérifie si l'utilisateur a un rôle dans un groupe spécifique
 */
export const aLeRoleDansGroupe = (roleCherche, nomGroupe) => {
  const groupesData = localStorage.getItem("groupes_info");
  if (!groupesData) return false;

  const groupes = JSON.parse(groupesData);
  const groupeSpecifique = groupes.find(g => g.nom === nomGroupe);

  return groupeSpecifique ? groupeSpecifique.roles.includes(roleCherche) : false;
};




export const hasPermission = (page) => {
  const role = localStorage.getItem("role");

  console.log("Vérification des permissions pour le rôle :", role, "et la page :", page);

  // Si aucune donnée n'est trouvée, l'utilisateur n'a aucun rôle
  if (!role) return false;


  const users_permissions = {
    'Assistant' : ['note_frais', 'expression_besoin'],
    'Agent Port' : ['rotations', 'clients', 'types de materiel', 'expression_besoin'],
    'Comptable' : ['factures', 'note_frais', 'devis', 'clients', 'expression_besoin', 'fournisseurs', 'bon_commande'],
    'Directeur des Opérations' : ['factures', 'note_frais', 'devis', 'clients', 'rotations', 'expression_besoin', 'fournisseurs', 'types de materiel', 'bon_commande', 'bad', 'archives', 'Rapports'],
    'Directeur Général' : ['factures', 'note_frais', 'expression_besoin', 'devis', 'clients', 'rotations', 'fournisseurs', 'types de materiel', 'bon_commande', 'archives'],
  }


  if (users_permissions[role]) {
    console.log("Permissions pour le rôle", role, ":", users_permissions[role].includes(page));
    return users_permissions[role].includes(page);
  }
  return false;

};



export const getRole = () => {
  const role = localStorage.getItem("role");
  return role || null;
};


export const getUserData = () => {
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");
  return { role, userId } ;
};


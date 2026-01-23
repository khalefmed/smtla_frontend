import React, { useEffect, useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useTranslation } from "react-i18next";
import { MdDelete } from "react-icons/md";
import { IoAdd } from "react-icons/io5";
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MdCancel } from "react-icons/md";

const AjouterEtudiant = ({supprimer, id}) => {
    const { i18n, t } = useTranslation();
    

  const [tab, setTab] = useState("individuel"); // Tab active : 'individuel' ou 'liste'

  // Champs individuels
  const [matricule, setMatricule] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [classe, setClasse] = useState("");
  const [contact, setContact] = useState("");
  const [naissance, setNaissance] = useState("");
  const [classes, setClasses] = useState([]);

  // Champs liste
  const [csvFile, setCsvFile] = useState(null);

          useEffect(() => {
            get();
          }, [])
        
          const get = async ()  => {
            try {
              const response = await api.get("classes"); 
              console.log(response)
              setClasses(response.data)
            }
            catch (exception){
              console.log(exception)
              toast.error(<p className="text-redColor">{t('Une erreur s\'est produite')}</p>);
            }
          }
    
  // Création individuelle
  const creerIndividuel = async (e) => {
    e.preventDefault();
    if (!nom || !prenom || !classe) {
      toast.error(<p className="text-redColor">{t('Veuillez remplir les champs obligatoires')}</p>);
      return;
    }

    try {
      await api.post("etudiants/", {
        matricule,
        prenom,
        nom,
        contact,
        date_naissance: naissance,
        classe,
        solde: 0
      });
      toast.success(t("Etudiant créé avec succès"));
      window.location.reload();
    } catch (err) {
      console.log(err);
      toast.error(<p className="text-redColor">{t("Une erreur s'est produite")}</p>);
    }
  };



const creerParListe = async () => {
  if (!csvFile) {
    toast.error(
      <p className="text-redColor">
        {t("Veuillez sélectionner un fichier CSV ou Excel")}
      </p>
    );
    return;
  }

  const formData = new FormData();
  formData.append("file", csvFile);

  try {
    const response = await api.post("etudiants/import/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    const created = response.data.created;
    const errors = response.data.errors;

    toast.success(t(`Import terminé : ${created} étudiant(s) créé(s)`));

    if (errors && errors.length > 0) {
      toast.error(
        errors.join("\n"), 
        { duration: 6000 }
      );
    }

    // Reload page after successful import
    window.location.reload();

  } catch (err) {
    console.log(err);
    toast.error(
      <p className="text-redColor">
        {t("Une erreur s'est produite lors de l'import")}
      </p>
    );
  }
};
    
    
        const valider = () => {
            if (nom == ""){
                return false;
            }
            return true;
        }


  return <AlertDialog.Root>
    <AlertDialog.Trigger asChild>
     <div className='bg-buttonGradientSecondary rounded-md shadow-lg flex flex-row justify-center align-center items-center font-medium text-md px-4 py-2 text-white gap-2 cursor-pointer' >
          <IoAdd />
          Ajouter
      </div>
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
      <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <AlertDialog.Title className="text-blackColor m-0 text-[17px] font-semibold text-center flex flex-row items-center justify-between">
          <div></div>
          {t("Nouveau etudiant")}
          <AlertDialog.Cancel asChild>
                      <button className="text-blackColor  hover:bg-bgGreyColor focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium ">
                        <MdCancel />
                      </button>
                    </AlertDialog.Cancel>
        </AlertDialog.Title>

        {/* TABS */}
          <div className="flex mb-4 border-b border-gray-300">
            <button
              className={`flex-1 py-2 ${tab === 'individuel' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              onClick={() => setTab("individuel")}
            >
              {t("Ajout individuel")}
            </button>
            <button
              className={`flex-1 py-2 ${tab === 'liste' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              onClick={() => setTab("liste")}
            >
              {t("Par liste")}
            </button>
          </div>



        {tab == 'individuel' && (
          <form onSubmit={(e) => creer(e)} className='w-full max-sm:w-full flex flex-col gap-6 mt-6  '>
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Code')}</p> */}
                    <input type="text" value={matricule} onChange={(e) => setMatricule(e.target.value)} placeholder={t("Matricule")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-normal text-md" />
                </div>
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Code')}</p> */}
                    <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder={t("Prenom")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-normal text-md" />
                </div>
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Code')}</p> */}
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder={t("Nom")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-normal text-md" />
                </div>
                <div>
                    <select
                        value={classe}
                        onChange={(e) => setClasse(e.target.value)}
                        className={`px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none  font-normal text-md ${classe != '' ? 'text-blackColor' : 'text-inputTextColor'}`}
                    >
                        <option value="">{t("Classe")}</option>

                        {classes.map((classe) => (
                            <option key={classe.id} value={classe.id}>
                                {classe.nom_classe}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Code')}</p> */}
                    <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t("Contact")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-normal text-md" />
                </div>
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Code')}</p> */}
                    <input type="date" value={naissance} onChange={(e) => setNaissance(e.target.value)} placeholder={t("Date de naissance")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-normal text-md" />
                </div>

                <div className='text-center'>
                  <input type="submit" onClick={creerIndividuel} value={t('Enregistrer')}  className="w-1/2  rounded-lg text-center py-2 mt-2 bg-buttonGradientSecondary  text-whiteColor font-normal cursor-pointer " />
                </div>
            </form>
        )}


          {tab === "liste" && (
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept=".csv, .xls, .xlsx"
                onChange={e => setCsvFile(e.target.files[0])}
                className="inputField"
              />
              <button onClick={creerParListe} className="mt-3 py-2 bg-buttonGradientSecondary text-white rounded">{t("Importer CSV")}</button>
            </div>
          )}
        {/* <div className="flex justify-end gap-2">
          <AlertDialog.Cancel asChild>
            <button className="text-textGreyColor  hover:bg-bgGreyColor focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium ">
              {t('Annuler')}
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action onClick={() => supprimer(id)}>
            <button className="text-red11 bg-red4 hover:bg-red5 focus:shadow-red7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]">
              {t("Oui, je suis sûr")}
            </button>
          </AlertDialog.Action>
        </div> */}
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
};

export default AjouterEtudiant;
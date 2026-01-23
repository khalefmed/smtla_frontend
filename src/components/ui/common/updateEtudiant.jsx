import React, { useEffect, useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useTranslation } from "react-i18next";
import { IoAdd } from "react-icons/io5";
import { MdCancel, MdEditSquare } from "react-icons/md";
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

const UpdateEtudiant = ({matr, f_name, l_name, grade, phone, birthday, balance, id }) => {
  const { t } = useTranslation();

  const [tab, setTab] = useState("individuel"); // Tab active : 'individuel' ou 'liste'

  // Champs individuels
  const [matricule, setMatricule] = useState("");
  const [prenom, setPrenom] = useState(f_name);
  const [nom, setNom] = useState(l_name);
  const [classe, setClasse] = useState(grade.id);
  const [contact, setContact] = useState(phone);
  const [naissance, setNaissance] = useState(birthday);
  const [classes, setClasses] = useState([]);

  // Champs liste
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    getClasses();
  }, []);

  const getClasses = async () => {
    try {
      const response = await api.get("classes");
      setClasses(response.data);
    } catch (err) {
      toast.error(<p className="text-redColor">{t("Une erreur s'est produite")}</p>);
    }
  };

  // Création individuelle
  const creerIndividuel = async (e) => {
    e.preventDefault();
    if (!nom || !prenom || !classe) {
      toast.error(<p className="text-redColor">{t('Veuillez remplir les champs obligatoires')}</p>);
      return;
    }

    try {
      await api.put(`etudiants/${id}/`, {
        matr,
        prenom,
        nom,
        contact,
        date_naissance: naissance,
        classe,
        solde: balance
      });
      toast.success(t("Etudiant créé avec succès"));
      window.location.reload();
    } catch (err) {
      console.log(err);
      toast.error(<p className="text-redColor">{t("Une erreur s'est produite")}</p>);
    }
  };

  // Import CSV
  const creerParListe = async () => {
    if (!csvFile) {
      toast.error(<p className="text-redColor">{t("Veuillez sélectionner un fichier CSV")}</p>);
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await api.post("upload-etudiants-csv/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(t(`Import terminé : ${response.data.created} étudiants créés`));
      if (response.data.errors.length) {
        toast.error(response.data.errors.join("\n"));
      }
      window.location.reload();
    } catch (err) {
      console.log(err);
      toast.error(<p className="text-redColor">{t("Une erreur s'est produite")}</p>);
    }
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
       <span className='  text-textGreyColor' >
          <MdEditSquare />
        </span>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-blackA6 fixed inset-0" />
        <AlertDialog.Content className="fixed top-[50%] left-[50%] max-w-[500px] w-[90vw] max-h-[85vh] translate-x-[-50%] translate-y-[-50%] bg-white p-6 rounded-md shadow-lg overflow-auto">
          <AlertDialog.Title className="text-center text-lg font-semibold mb-4 flex justify-between items-center">
            {t("Modification")}
            <AlertDialog.Cancel asChild>
              <button className="text-black hover:bg-gray-200 p-2 rounded">
                <MdCancel />
              </button>
            </AlertDialog.Cancel>
          </AlertDialog.Title>

          {/* TABS */}
          {/* <div className="flex mb-4 border-b border-gray-300">
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
          </div> */}

        {tab == 'individuel' && (
          <form onSubmit={(e) => creer(e)} className='w-full max-sm:w-full flex flex-col gap-6 mt-6  '>
                
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
                  <input type="submit" onClick={creerIndividuel} value={t('Modifier')}  className="w-1/2  rounded-lg text-center py-2 mt-2 bg-buttonGradientSecondary  text-whiteColor font-normal cursor-pointer " />
                </div>
            </form>
        )}

          {tab === "liste" && (
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={e => setCsvFile(e.target.files[0])}
                className="inputField"
              />
              <button onClick={creerParListe} className="mt-3 py-2 bg-buttonGradientSecondary text-white rounded">{t("Importer CSV")}</button>
            </div>
          )}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default UpdateEtudiant;
import React, { useEffect, useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useTranslation } from "react-i18next";
import { MdDelete } from "react-icons/md";
import { IoAdd } from "react-icons/io5";
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MdCancel } from "react-icons/md";

const AjouterTransaction = ({supprimer, id}) => {
    const { i18n, t } = useTranslation();
    
        const [montant, setMontant] = useState("");
        const [note, setNote] = useState("");
        const [type, setType] = useState("");
        const [etudiant, setEtudiant] = useState("");
        const [compte, setCompte] = useState("");
        const [types, setTypes] = useState([]);
        const [comptes, setComptes] = useState([]);
        const [etudiants, setEtudiants] = useState([]);

          useEffect(() => {
            get();
          }, [])
        
          const get = async ()  => {
            try {
              const response = await api.get("types"); 
              const response2 = await api.get("comptes"); 
              const response3 = await api.get("etudiants"); 
              console.log(response)
              setTypes(response.data)
              setComptes(response2.data)
              setEtudiants(response3.data)
            }
            catch (exception){
              console.log(exception)
              toast.error(<p className="text-redColor">{t('Une erreur s\'est produite')}</p>);
            }
          }
    
        const creer = async (e)  => {
            e.preventDefault();
            if (valider()) {
                try {
                    const response = await api.post(
                      "transactions/",
                      {
                          "montant" : montant ,
                          "type" : type ,
                          "compte" : compte ,
                          "etudiant" : etudiant ,
                          "note" : note ,
                      }
                      ); 
                      window.location = "/transactions"
                  }
                  catch (exception){
                    console.log(exception)
                    toast.error(<p className="text-redColor">{t('Une erreur s\'est produite')}</p>);
                  }
    
            }
            else {
                toast.error(<p className="text-redColor">{t('Veuillez remplir les champs')}</p>);
            }
            
        }
    
    
        const valider = () => {
            if (montant == "" || compte == "" || type == ""){
                return false;
            }
            return true;
        }


  return <AlertDialog.Root>
    <AlertDialog.Trigger asChild>
     <div className='bg-buttonGradientSecondary rounded-md shadow-lg flex flex-row justify-center align-center items-center font-medium text-md px-4 py-2 text-white gap-2 cursor-pointer' >
          <IoAdd />
          Nouvelle
      </div>
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
      <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <AlertDialog.Title className="text-blackColor m-0 text-[17px] font-semibold text-center flex flex-row items-center justify-between">
          <div></div>
          {t("Nouvelle transaction")}
          <AlertDialog.Cancel asChild>
                      <button className="text-blackColor  hover:bg-bgGreyColor focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium ">
                        <MdCancel />
                      </button>
                    </AlertDialog.Cancel>
        </AlertDialog.Title>
        <form onSubmit={(e) => creer(e)} className='w-full max-sm:w-full flex flex-col gap-6 mt-6  '>
                
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Code')}</p> */}
                    <input type="number" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder={t("Montant")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-normal text-md" />
                </div>
                
                <div>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={`px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none  font-normal text-md ${type != '' ? 'text-blackColor' : 'text-inputTextColor'}`}
                    >
                        <option value="">{t("Type")}</option>

                        {types.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.nom_type}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        value={compte}
                        onChange={(e) => setCompte(e.target.value)}
                        className={`px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none  font-normal text-md ${compte != '' ? 'text-blackColor' : 'text-inputTextColor'}`}
                    >
                        <option value="">{t("Compte")}</option>

                        {comptes.map((compte) => (
                            <option key={compte.id} value={compte.id}>
                                {compte.nom_compte}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        value={etudiant}
                        onChange={(e) => setEtudiant(e.target.value)}
                        className={`px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none  font-normal text-md ${etudiant != '' ? 'text-blackColor' : 'text-inputTextColor'}`}
                    >
                        <option value="">{t("Etudiant")}</option>

                        {etudiants.map((etudiant) => (
                            <option key={etudiant.id} value={etudiant.id}>
                                {etudiant.matricule}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Code')}</p> */}
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Note")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-normal text-md" />
                </div>


                

                <div className='text-center'>
                  <input type="submit" onClick={creer} value={t('Enregistrer')}  className="w-1/2 rounded rounded-lg text-center py-2 mt-2 bg-buttonGradientSecondary  text-whiteColor font-normal cursor-pointer " />
                </div>
            </form>
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

export default AjouterTransaction;
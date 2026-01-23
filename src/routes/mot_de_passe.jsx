import { api } from '@/lib/api';
import {useState, useEffect} from 'react'
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next'


export const MotDePasse = () => {
    const {t} = useTranslation();


    const [ancien, setAncien] = useState("");
    const [nouveau, setNouveau] = useState("");
    const [confirmation, setConfirmation] = useState("");


    const modifier = async (e)  => {
        e.preventDefault();
        if (valider()) {
            
            try {
                const response = await api.put(
                    `modifier_mot_de_passe/`,
                  {
                      "ancien" : ancien,
                      "nouveau" : nouveau ,
                  }
                  ); 
                  window.location.reload()
              }
              catch (exception){
                console.log(exception)
                if (exception.response && exception.response.status === 400) {
                    toast.error(<p className="text-redColor">{t('Ancien mot de passe incorrect')}</p>);
                } else {
                    toast.error(<p className="text-redColor">{t("Une erreur s'est produite")}</p>);
                }
              }

        }
        else {
            toast.error(<p className="text-redColor">{t('Veuillez remplir les champs')}</p>);
        }
        
    }


    const valider = () => {
        if (ancien == "" || nouveau == "" ||  confirmation == ""){
            return false;
        }
        else {
            if (nouveau != confirmation){
                return false;
            }
        }
        return true;
    }
    
    return (
        <div className='p-10 mx-10 flex flex-col gap-8 bg-whiteColor rounded-lg shadow-xl shadow-shadowColor'>
            <div className='flex flex-col gap-4'>
                <h1 className='text-2xl text-blackColor font-bold'>{t('Modifier le mot de passe')}</h1>
                <p className='text-lg max-sm:text-sm text-textGreyColor font-medium '>{t('Veuillez remplir les champs suivant  pour modifier votre mot de passe')}</p>
            </div>
            <form onSubmit={(e) => modifier(e)} className='w-[400px] max-sm:w-full flex flex-col gap-8 '>
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Ancien')}</p> */}
                    <input type="password" value={ancien} onChange={(e) => setAncien(e.target.value)} placeholder={t("Entrez l\'ancien mot de passe")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-textGreyColor font-medium" />
                </div>
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Nouveau')}</p> */}
                    <input type="password" value={nouveau} onChange={(e) => setNouveau(e.target.value)} placeholder={t("Entrez le nouveau mot de passe")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-textGreyColor font-medium" />
                </div>
                <div>
                    {/* <p  className='text-lg  text-blackColor font-semibold'>{t('Confrimation')}</p> */}
                    <input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder={t("Entrez le nouveau mot de passe")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-textGreyColor font-medium" />
                </div>

                <input type="submit" onClick={modifier} value={t("Modifier le mot de passe")}  className="w-full rounded-lg text-center py-2 mt-2 bg-buttonGradientSecondary text-whiteColor font-medium cursor-pointer " />
            </form>

        </div>
    )
}

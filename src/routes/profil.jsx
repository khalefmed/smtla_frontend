import { api } from '@/lib/api';
import {useState, useEffect} from 'react'
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next'


export const Profil = () => {
    const {t} = useTranslation();

    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [nom_utilisateur, setNomUtilisateur] = useState("");
    const [telephone, setTelephone] = useState("");
    const [etablissement, setEtablissement] = useState("Trésor");

    useEffect(() => {
        get();
    }, [])
  
      const get = async ()  => {
        try {
          const response = await api.get(`profil/`); 
          setNom(response.data.last_name);
          setPrenom(response.data.first_name);
          setNomUtilisateur(response.data.username);
          setTelephone(response.data.telephone);
          if (response.data.etablissement != null){
            setEtablissement(response.data.etablissement)
          }
        }
        catch (exception){
          console.log(exception)
          toast.error(<p className="text-redColor">{t('Une erreur s\'est produite')}</p>);
        }
    }
  
    
    return (
        <div className='p-10 mx-10 flex flex-col gap-3 bg-whiteColor rounded-lg shadow-xl shadow-shadowColor'>
            <h1 className='text-2xl text-blackColor font-bold'>{t('Mon Profil')}</h1>
            <p className='text-lg max-sm:text-sm text-textGreyColor font-medium '>{""}</p>
            <div className='w-[400px] max-sm:w-full flex flex-col gap-4 '>
                <div>
                    <p  className='text-md  text-blackColor font-semibold'>{t('Prenom')}</p>
                    <p className='text-md text-textGreyColor font-medium'>{prenom}</p>
                </div>
                <div>
                    <p  className='text-md  text-blackColor font-semibold'>{t('Nom')}</p>
                    <p className='text-md text-textGreyColor font-medium'>{nom}</p>
                </div>
                <div>
                    <p  className='text-md  text-blackColor font-semibold'>{t('Nom d\'utilisateur')}</p>
                    <p className='text-md text-textGreyColor font-medium'>{nom_utilisateur}</p>
                </div>
                <div>
                    <p  className='text-md  text-blackColor font-semibold'>{t('Telephone')}</p>
                    <p className='text-md text-textGreyColor font-medium'>{telephone}</p>
                </div>
                <div>
                    <p  className='text-md  text-blackColor font-semibold'>{t('Etablissement')}</p>
                    <p className='text-md text-textGreyColor font-medium'>{etablissement}</p>
                </div>

            </div>

        </div>
    )
}

import { api } from '@/lib/api';
import {useState, useEffect} from 'react'
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom';


export const ModifierEtablissement = () => {
    const {id} = useParams()
    const {t} = useTranslation();

    const [code, setCode] = useState("");
    const [nom, setNom] = useState("");
    const [url_fichier, setUrlFichier] = useState("");


    useEffect(() => {
      get()
      
    }, [])

    const get = async ()  => {
      try {
        const response = await api.get(`etablissements/${id}/`); 
        setCode(response.data.code_etablissement);
        setNom(response.data.nom_etablissement);
        setUrlFichier(response.data.url_fichier);
      }
      catch (exception){
        console.log(exception)
        toast.error(<p className="text-redColor">{t('Une erreur s\'est produite')}</p>);
      }
  }

    const modifier = async (e)  => {
        e.preventDefault();
        if (valider()) {
            try {
                const response = await api.put(
                  `etablissements/${id}/`,
                  {
                      "code_etablissement" : code,
                      "nom_etablissement" : nom ,
                      "url_fichier" : url_fichier ,
                  }
                  ); 
                  window.location = "/etablissements"
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
        if (code == "" || nom == ""){
            return false;
        }
        return true;
    }
    
    return (
        <div className='p-10 mx-10 flex flex-col gap-3 bg-whiteColor rounded-lg shadow-xl shadow-shadowColor'>
            <h1 className='text-2xl text-blackColor font-bold'>{t('Modifier l\'établissement')}</h1>
            <p className='text-lg max-sm:text-sm text-textGreyColor font-medium '>{t('Veuillez remplir les champs suivant  pour modifier l\'établissement')}</p>
            <form onSubmit={(e) => modifier(e)} className='w-[400px] max-sm:w-full flex flex-col gap-4 '>
                <div>
                    <p  className='text-lg  text-blackColor font-semibold'>{t('Code')}</p>
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("Entrez le code de l'entreprise")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-medium" />
                </div>
                <div>
                    <p  className='text-lg  text-blackColor font-semibold'>{t('Nom')}</p>
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder={t("Entrez le nom de l'entreprise")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-medium" />
                </div>
                <div>
                    <p  className='text-lg  text-blackColor font-semibold'>{t('Fichier')}</p>
                    <input type="text" value={url_fichier} onChange={(e) => setUrlFichier(e.target.value)} placeholder={t("Entrez le nom de l'url du fichier excel")} className="px-4 py-2 w-full bg-inputFieldColor rounded-lg outline-none placeholder-inputTextColor font-medium" />
                </div>

                <input type="submit" onClick={modifier} value={t("Modifier l'entreprise")}  className="w-full rounded text-center py-2 mt-2 bg-gradient-to-b from-buttonGradientSecondary to-buttonGradientPrimary text-whiteColor font-medium cursor-pointer " />
            </form>

        </div>
    )
}

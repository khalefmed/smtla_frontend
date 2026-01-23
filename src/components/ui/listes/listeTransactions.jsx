import {useState, useEffect} from 'react'
import { useTranslation } from "react-i18next";

import DetailsTransaction from '../common/DetailsTransaction';

export const ListeTransactions = ({donnees, setDonnees}) => {
    const { i18n, t } = useTranslation();
    const [liste, setListe] = useState(donnees)


    useEffect(() => {
        setListe(liste)
    }, [])


    return (
        <div className='w-full overflow-x-scroll'>
            <table className='w-full border-separate border-spacing-y-2'>
                <thead className="bg-whiteColor">
                    <tr>
                        <th className="py-4 px-4 text-start text-blackColor font-semibold text-sm rounded-tl-lg">
                            {t("Type")}
                        </th>
                        <th className="py-4 text-start text-blackColor font-semibold text-sm">
                            {t("Montant")}
                        </th>
                        <th className="py-4 text-start text-blackColor font-semibold text-sm">
                            {t("Compte")}
                        </th>
                        <th className="py-4 text-start text-blackColor font-semibold text-sm">
                            {t("Date")}
                        </th>
                        <th className="py-4 text-center w-52 text-blackColor font-semibold text-sm rounded-tr-lg">
                            {t("Action")}
                        </th>
                    </tr>
                </thead>
                <tbody className=''>
                    {donnees.map((e) => 
                    <tr key={e.id} className='bg-whiteColor'>
                        <td className={`py-4 px-4 min-w-[200px] text-start text-black font-medium text-sm rounded-lg`}>{e.type.nom_type}</td>
                        <td className={`py-4 min-w-[200px] text-start  font-medium text-sm ${e.type.is_debiteur ? 'text-red-500' : 'text-green-500'} text-red`}>{(e.type.is_debiteur ? '- ' : '+ ') +  e.montant + ' MRU'}</td>
                        <td className='py-4 min-w-[200px] text-start text-black font-medium text-sm '>{e.compte.nom_compte}</td>
                        <td className='py-4 min-w-[100px] text-start text-black font-medium text-sm '>{e.date}</td>
                        <td className='py-4 w-60 flex flex-row gap-1 justify-center align-center  text-center text-textGreyColor font-normal  rounded-lg'>
                            {/* <ModifierBoutton lien="etablissements" id={e.id} /> */}
                            <DetailsTransaction transaction={e}/>
                        </td>
                    </tr>
                    )}
                </tbody>

            </table>
        </div>
    )
}

import React from 'react'
import { useTranslation } from 'react-i18next';
import { FaSearch } from "react-icons/fa";

export const Recherche = ({rechercher, recherche, setRecherche}) => {
    const {t} = useTranslation()
    return (
        <form action="" className='flex flex-row gap-1 max-sm:w-full' onSubmit={rechercher}>
            <input type="text" placeholder={t('Rechercher')} value={recherche} onChange={(e) => setRecherche(e.target.value)} className='w-[300px] max-sm:w-full placeholder:text-sm text-sm px-4 py-2 rounded-md outline-none' />
            <input type="submit" value="" className=' rounded-md bg-gradient-to-b from-buttonGradientSecondary to-buttonGradientPrimary text-whiteColor text-xs cursor-pointer font-light' />
            <div className='flex items-center justify-center align-center px-4 py-1 rounded-md bg-gradient-to-b from-buttonGradientSecondary to-buttonGradientPrimary text-whiteColor text-xs cursor-pointer font-light' >
                <FaSearch onClick={rechercher} />
            </div> 
        </form>
    )
}

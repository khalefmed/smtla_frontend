import React from 'react'
import { useTranslation } from 'react-i18next'
import { BsEye } from 'react-icons/bs'

export const VoirButton = ({lien, id}) => {
    const {t} = useTranslation()
    return (
        <a href={`${lien}/${id}`} className='px-3 py-2 min-w-24 flex flex-row items-center justify-center align-center gap-1 rounded-md border border-1 border-blackColor text-blackColor hover:bg-blackColor hover:text-whiteColor text-lg duration-500 font-medium'>
            <BsEye size={13}/>
            <span className='text-xs'>{t("Voir")}</span>
        </a>
    )
}

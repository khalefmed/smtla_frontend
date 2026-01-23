import React from 'react'
import { useTranslation } from 'react-i18next'
import { IoIosAddCircle } from 'react-icons/io'

export const NouveauBoutton = ({lien}) => {
    const {t} = useTranslation()
    return (
        <a href={`${lien}/creer`} className='px-4 py-2 max-sm:w-full flex flex-row items-center align-center justify-center gap-2 rounded-md bg-gradient-to-b from-buttonGradientSecondary to-buttonGradientPrimary text-whiteColor text-xs cursor-pointer font-light'>
          <IoIosAddCircle size={20} />
          <p className='font-medium'>{t('Nouveau')}</p>
        </a>
    )
}

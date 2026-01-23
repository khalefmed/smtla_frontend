import React from 'react'
import { useTranslation } from "react-i18next";


export const StatsCard = ({label, titre, valeur, icon: Icon}) => {
    const { i18n, t } = useTranslation();
    return (
        <div className='w-[30%] max-lg:w-[32%] max-sm:w-full bg-whiteColor rounded-lg p-4 max-sm:p-8 flex flex-col gap-2 shadow-lg shadow-shadowColor '>
            <div className='p-2 w-fit bg-shadowColor rounded-lg text-blackColor'>
                <Icon  size={40}/>
            </div>
            <p className='text-textGreyColor text-sm font-normal'>{titre}</p>
            <p className='text-blackColor text-xl font-semibold'><span className='text-blackColor font-extrabold'>{valeur}</span> {label}</p>
        </div>
    )
}

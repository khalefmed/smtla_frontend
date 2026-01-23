import React, { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useTranslation } from "react-i18next";
import { MdDelete } from "react-icons/md";
import { IoAdd } from "react-icons/io5";
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MdCancel } from "react-icons/md";
import { EyeIcon } from '@heroicons/react/20/solid';

const DetailsTransaction = ({transaction}) => {
    const { i18n, t } = useTranslation();


  return <AlertDialog.Root>
    <AlertDialog.Trigger asChild>
     <div className='bg-gradient-to-b from-buttonGradientSecondary to-buttonGradientPrimary text-whiteColor text-xs px-2 py-1 w-8 h-6 rounded-lg' >
        <EyeIcon/> 
    </div>
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
      <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <AlertDialog.Title className="text-blackColor m-0 text-[17px] font-semibold text-center flex flex-row items-center justify-between">
          <div></div>
          {t("Details de la transation")}
          <AlertDialog.Cancel asChild>
                      <button className="text-blackColor  hover:bg-bgGreyColor focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium ">
                        <MdCancel />
                      </button>
                    </AlertDialog.Cancel>
        </AlertDialog.Title>

        <br />
        <div className='flex flex-row'>
          <div className='flex flex-col justify-start items-start align-start w-full '>
            <h3 className='text-blackColor text-md font-semibold'  >Type</h3>
            <p className='text-textGreyColor text-sm'>{transaction.type.nom_type}</p>
          </div>
          <div className='flex flex-col justify-start items-start align-start w-full '>
            <h3  className='text-blackColor text-md font-semibold'  >Compte</h3>
            <p className='text-textGreyColor text-sm'>{transaction.compte.nom_compte}</p>
          </div>
        </div>
        <br />
        <div className='flex flex-row'>
          <div className='flex flex-col justify-start items-start align-start w-full '>
            <h3 className='text-blackColor text-md font-semibold'  >Date</h3>
            <p className='text-textGreyColor text-sm'>{transaction.date}</p>
          </div>
          <div className='flex flex-col justify-start items-start align-start w-full '>
            <h3  className='text-blackColor text-md font-semibold'  >Montant</h3>
            <p className='text-textGreyColor text-sm'>{transaction.montant}</p>
          </div>
        </div>
        <br />
        <div className='flex flex-row'>
          {transaction.etudiant && <div className='flex flex-col justify-start items-start align-start w-full '>
            <h3 className='text-blackColor text-md font-semibold'  >Etudiant</h3>
            <p className='text-textGreyColor text-sm'>{transaction.etudiant.matricule}</p>
          </div>}
          <div className='flex flex-col justify-start items-start align-start w-full '>
            <h3  className='text-blackColor text-md font-semibold'  >Note</h3>
            <p className='text-textGreyColor text-sm'>{transaction.note == '' ? '-----' : transaction.note}</p>
          </div>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
};

export default DetailsTransaction;
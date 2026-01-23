import { ETAPES_DOSSIER } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";

export const ListeDossiers = ({ donnees }) => {
  const { t } = useTranslation();

  return (
    <div className='w-full overflow-x-scroll'>
      <table className='w-full border-separate border-spacing-y-2'>

        <thead className="bg-whiteColor">
          <tr>
            <th className="py-4 px-4 text-start text-blackColor font-semibold text-sm rounded-tl-lg">
              {t("Numero")}
            </th>

            <th className="py-4 text-start text-blackColor font-semibold text-sm">
              {t("Titre")}
            </th>

            <th className="py-4 text-start text-blackColor font-semibold text-sm">
              {t("Type")}
            </th>

            <th className="py-4 text-start text-blackColor font-semibold text-sm rounded-tr-lg">
              {t("Étape")}
            </th>

            <th className="py-4 text-start text-blackColor font-semibold text-sm rounded-tr-lg">
              {t("Date de creation")}
            </th>
            <th className="py-4 text-start text-blackColor font-semibold text-sm rounded-tr-lg">
              {t("Action")}
            </th>
          </tr>
        </thead>

        <tbody>
          {donnees.map((dossier) => (
            <tr key={dossier.id} className='bg-whiteColor rounded-lg'>

              <td className='py-4 px-4 min-w-[100px] text-blackColor font-medium text-sm'>
                {dossier.numero}
              </td>

              <td className='py-4 min-w-[100px] text-blackColor font-medium text-sm'>
                {dossier.titre}
              </td>

              <td className='py-4 min-w-[100px] text-blackColor font-medium text-sm'>
                {dossier.type}
              </td>

              <td className='py-4 min-w-[100px] text-primaryColor font-medium text-sm'>
                {ETAPES_DOSSIER[dossier.etape]}
              </td>

              <td className='py-4 min-w-[150px] text-blackColor font-medium text-sm'>
                {dossier.date_creation}
              </td>

              <td className='py-4 min-w-[150px] text-blackColor font-medium text-sm'>
                <a href={`/dossiers/details/${dossier.id}`}>Voir détails</a>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};
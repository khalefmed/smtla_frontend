import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from "react-i18next";
  


ChartJS.register(ArcElement, Tooltip, Legend);

export  function DoughnutComponent({colis}) {

  const { t, i18n } = useTranslation();


 const options  = {
    maintainAspectRatio: false,
    aspectRatio: 45, 
    animation: {
        duration : 2500,
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',

      },
      title: {
        display: true,
        text: t('distributionColisAgences'),
      },
    },
};
console.log("lkjhg")
console.log(colis.DKR)



 const data = {
    labels: [t('NKTT'), t('DKR')],
    datasets: [
      {
        label: '# ',
        data: [
          colis.NKTT != null ? colis.NKTT : 0,
          colis.DKR != null ? colis.DKR : 0,

        ],
        backgroundColor: [
            '#FFCC00CB',
            '#07AA0F',
        ],
        borderColor: [
            '#FFCC00',
            '#07AA0F',
        ],
        borderWidth: 2,
        
      },
    ],
  };


  return (
    <div className='bg-whiteColor h-[300px] w-1/2 max-sm:w-full shadow-lg rounded-lg p-3 flex justify-center items-center'>
      <Doughnut data={data}  options={options}/>
    </div>
  );
}

export default DoughnutComponent;
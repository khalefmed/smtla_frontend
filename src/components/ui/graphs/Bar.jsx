import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from "react-i18next";
  

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
//   animation: {
//     duration : 2500,
// },
  // responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: '',
    },
  },
  scales: {
    y: {
        min: 0 ,
        ticks: {
          stepSize: 1,  
          callback: function(value) {
              return Number.isInteger(value) ? value : '';
          }
      }
    }
  }
};



export default function BarComponent({colis}) {
  const { t, i18n } = useTranslation();

  // const labels = [t('step1'), t('step2'), t('step3'), t('step4')];
  // const labelsValues = [
  //   colis.step1 != null ? colis.step1 : 0,
  //   colis.step2 != null ? colis.step2 : 0,
  //   colis.step3 != null ? colis.step3 : 0,
  //   colis.step4 != null ? colis.step4 : 0,
  // ];

  const data = {
    labels,
    datasets: [
      {
        label: t('nombreColis'),
        data: labelsValues.map((val) => val),
        backgroundColor: '#1C1C27',
      },
    ],
  };

  return (
    <div className='bg-whiteColor h-[300px] w-1/2 max-sm:w-full shadow-lg rounded-lg p-3 flex justify-center items-center'>
      <Bar options={options} data={data} />
    </div>
  );
}
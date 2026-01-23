import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslation } from "react-i18next";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export function   LineComponent({stats}) {

  console.log(stats)
  const { t, i18n } = useTranslation();

  const options = {
    animation: {
        duration : 2500,
    },
    responsive: true,
    plugins: {
      
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('Les etats de salaires dans les 3 derniers mois'),
      },
    },
    scales: {
      y: {
          min: 0 ,
          ticks: {
            stepSize: 0,  
            callback: function(value) {
                return Number.isInteger(value) ? value : '';
            }
        }
      }
    }
  };

  const labels = stats.map((e) => t(e.mois));
  const labelsValues = stats.map((e) => e.montant);

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: t('Montants'),
        data: labelsValues,
        borderColor: '#2868C8',
        backgroundColor: '#002B6C8D',
        borderWidth : 1
      },
      
    ],
  };


  return (
    <div className='bg-whiteColor h-[500px] max-sm:h-[300px]  w-full max-sm:w-full shadow-lg rounded-lg p-3 flex justify-center items-center'>
        <Line options={options} data={data} />
    </div>
    );
  
}
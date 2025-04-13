import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';

// Register required components
Chart.register(PieController, ArcElement, Tooltip, Legend);

(async function () {
  const canvas = document.querySelector<HTMLCanvasElement>(`canvas[data-chart="network"]`);
  const ctx = canvas.getContext("2d");

  const data: ChartData = {
    labels: [
      'CFO/Finanzchef',
      'COO',
      'Supply Chain Manager',
      'Leiter Marketing und Verkauf',
      'Leiter Produktion',
      'Leiter Entwicklung',
      'CEO/Direktor/Verwaltungsrat'
    ],
    datasets: [{
      label: 'Verteilung',
      data: [12, 16, 6, 11, 9, 10, 36],
      backgroundColor: [
        '#3B3324',
        '#544933',
        '#6E5F43',
        '#877652',
        '#A18C62',
        '#BAA272',
        '#DEC187',
        '#EDCE91',
      ],
      borderColor: '#ffffff',
      borderWidth: 0,
    }]
  }

  new Chart(ctx, {
    type: 'pie',
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#fff',
            // font: {
            //   family: 'Arial, sans-serif', // 👈 your font family here
            //   size: 14,
            // }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw;
              return `${label}: ${value}%`;
            }
          }
        }
      }
    }
  });
})();


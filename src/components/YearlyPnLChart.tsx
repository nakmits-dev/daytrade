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
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TradeDataStore } from '../lib/types';
import { getJSTDate } from '../lib/date';

// Chart.jsの初期化
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

interface YearlyPnLChartProps {
  tradeData: TradeDataStore;
}

export default function YearlyPnLChart({ tradeData }: YearlyPnLChartProps) {
  const calculateDailyData = () => {
    const now = getJSTDate(new Date());
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // 日次の累計を計算
    const dailyPnL: { [key: string]: number } = {};
    let runningTotal = 0;

    Object.entries(tradeData)
      .filter(([date]) => new Date(date) >= oneYearAgo)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, data]) => {
        if (!data.deleted) {
          runningTotal += data.pnl;
          dailyPnL[date] = runningTotal;
        }
      });

    // 日付ラベルとデータを生成
    const sortedDates = Object.keys(dailyPnL).sort();
    const labels = sortedDates.map(date => {
      const [year, month, day] = date.split('-');
      return `${month}/${day}`;
    });
    const data = sortedDates.map(date => dailyPnL[date]);

    return { labels, data };
  };

  const { labels, data } = calculateDailyData();

  const chartData = {
    labels,
    datasets: [
      {
        label: '累計損益',
        data: data,
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        pointRadius: 0,
        pointHitRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `${value.toLocaleString()}円`;
          },
          title: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            const sortedDates = Object.keys(tradeData).sort();
            const date = sortedDates[index];
            if (date) {
              const [year, month, day] = date.split('-');
              return `${year}/${month}/${day}`;
            }
            return '';
          }
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 20,
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => {
            return `${value.toLocaleString()}円`;
          },
          stepSize: Math.ceil(Math.max(...data.map(Math.abs)) / 5),
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
        損益推移
      </h4>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
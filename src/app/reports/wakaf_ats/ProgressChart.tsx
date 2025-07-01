import { Box } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProgressChartProps {
  currentCollected: number;
  remainingNeeded: number;
}

export default function ProgressChart({
  currentCollected,
  remainingNeeded,
}: ProgressChartProps) {
  const total = currentCollected + remainingNeeded;
  const percentCollected =
    total > 0 ? Math.round((currentCollected / total) * 100) : 0;
  const percentRemaining =
    total > 0 ? Math.round((remainingNeeded / total) * 100) : 0;
  const data = {
    labels: [
      `Terkumpul (${percentCollected}%)`,
      `Sisa Kebutuhan (${percentRemaining}%)`,
    ],
    datasets: [
      {
        label: '# of Dana',
        data: [currentCollected, remainingNeeded],
        backgroundColor: [
          '#16a34a', // Terkumpul
          '#6B46C1', // Sisa Kebutuhan
        ],
        borderColor: ['#16a34a', '#6B46C1'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const, // legend inline with chart
        align: 'center' as const, // center legend vertically
        labels: {
          boxWidth: 20,
        },
      },
      // Remove title for clean centering
    },
  };

  return (
    <Box
      w="full"
      display="flex"
      flexDirection="column"
      alignItems="center"
      h="250px"
      position="relative"
    >
      <Doughnut
        data={data}
        options={options}
        width={220}
        height={220}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </Box>
  );
}

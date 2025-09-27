import {
  TabPanel,
  Center,
  Spinner,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { FiClock } from 'react-icons/fi';

import type { QuizAttempt } from '~/lib/types/quiz';

interface LeaderboardTabProps {
  leaderboard: Array<QuizAttempt & { userName: string }>;
  leaderboardLoading: boolean;
}

const LeaderboardTab = ({
  leaderboard,
  leaderboardLoading,
}: LeaderboardTabProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  if (leaderboardLoading) {
    return (
      <TabPanel px={0}>
        <Center py={8}>
          <Spinner />
        </Center>
      </TabPanel>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <TabPanel px={0}>
        <Box textAlign="center" py={8}>
          <Text color="gray.500">
            Belum ada peserta yang menyelesaikan kuis ini
          </Text>
          <Text color="gray.400" fontSize="sm" mt={2}>
            Jadilah yang pertama!
          </Text>
        </Box>
      </TabPanel>
    );
  }

  return (
    <TabPanel px={0}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Peringkat</Th>
            <Th>Nama</Th>
            <Th>Skor</Th>
            <Th>Waktu</Th>
          </Tr>
        </Thead>
        <Tbody>
          {leaderboard.map((entry, index) => (
            <Tr key={entry.id}>
              <Td>
                <HStack>
                  {index === 0 && <Text>🥇</Text>}
                  {index === 1 && <Text>🥈</Text>}
                  {index === 2 && <Text>🥉</Text>}
                  <Text fontWeight="bold">#{index + 1}</Text>
                </HStack>
              </Td>
              <Td>
                <Text fontWeight="medium">{entry.userName}</Text>
              </Td>
              <Td>
                <Badge colorScheme={getScoreColor(entry.score)} fontSize="sm">
                  {entry.score}%
                </Badge>
              </Td>
              <Td>
                <HStack>
                  <FiClock size={14} />
                  <Text>{formatTime(entry.timeSpent)}</Text>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TabPanel>
  );
};

export default LeaderboardTab;

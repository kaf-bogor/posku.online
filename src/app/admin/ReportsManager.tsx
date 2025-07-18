import { Box, Heading, VStack, Button, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

interface Report {
  id: string;
  title: string;
  content: string;
}

const ReportsManager = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    // Fetch reports from API
    const fetchReports = async () => {
      const response = await fetch('/api/reports');
      const data = await response.json();
      setReports(data);
    };
    fetchReports();
  }, []);

  const addReport = async () => {
    const newReport = {
      id: Date.now().toString(),
      title: 'New Report',
      content: 'Content here',
    };
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    });
    if (response.ok) {
      setReports([...reports, newReport]);
    }
  };

  return (
    <Box
      p={4}
      mb={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.200"
      bg="gray.50"
    >
      <Heading size="md" mb={4}>
        Reports Manager
      </Heading>
      <VStack align="stretch" spacing={3}>
        {reports.map((report) => (
          <Box key={report.id} p={3} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold">{report.title}</Text>
            <Text>{report.content}</Text>
          </Box>
        ))}
        <Button colorScheme="blue" onClick={addReport}>
          Add Report
        </Button>
      </VStack>
    </Box>
  );
};

export default ReportsManager;

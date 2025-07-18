import { Box, Heading, VStack, Button, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

interface Progress {
  id: string;
  title: string;
  description: string;
}

const ProgressManager = () => {
  const [progressItems, setProgressItems] = useState<Progress[]>([]);

  useEffect(() => {
    // Fetch progress items from API
    const fetchProgressItems = async () => {
      const response = await fetch('/api/progress');
      const data = await response.json();
      setProgressItems(data);
    };
    fetchProgressItems();
  }, []);

  const addProgressItem = async () => {
    const newProgressItem = {
      id: Date.now().toString(),
      title: 'New Progress',
      description: 'Description here',
    };
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProgressItem),
    });
    if (response.ok) {
      setProgressItems([...progressItems, newProgressItem]);
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
        Progress Manager
      </Heading>
      <VStack align="stretch" spacing={3}>
        {progressItems.map((item) => (
          <Box key={item.id} p={3} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold">{item.title}</Text>
            <Text>{item.description}</Text>
          </Box>
        ))}
        <Button colorScheme="green" onClick={addProgressItem}>
          Add Progress
        </Button>
      </VStack>
    </Box>
  );
};

export default ProgressManager;

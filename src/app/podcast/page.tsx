'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Stack,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { listPodcasts } from '~/lib/services/contentService';

const PodcastPage = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');

  const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPodcasts()
      .then(setPodcasts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="md" color="purple.500" />
      </Center>
    );
  }
  return (
    <Container maxW="3xl" py={8}>
      <Heading as="h1" size="lg" mb={6} textAlign="center">
        Podcast
      </Heading>
      {podcasts.length > 0 ? (
        <VStack spacing={6} align="stretch">
          {podcasts.map((podcast) => (
            <Box
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorder}
              borderRadius="lg"
              p={6}
              w="100%"
              shadow="sm"
            >
              <Stack spacing={3}>
                <Heading as="h3" size="md">
                  {podcast.title}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  {podcast.description}
                </Text>
                {/* HTML5 Audio Player with default controls (play, pause, etc.) */}
                <audio controls style={{ width: '100%' }} src={podcast.url}>
                  <track kind="captions" />
                  Your browser does not support the <code>audio</code> element.
                </audio>
              </Stack>
            </Box>
          ))}
        </VStack>
      ) : (
        <Text textAlign="center" color="gray.500">
          Belum ada podcast tersedia.
        </Text>
      )}
    </Container>
  );
};

export default PodcastPage;

interface PodcastItem {
  id: string;
  title: string;
  summary: string; // added to satisfy ManagedItem
  imageUrls: string[]; // added to satisfy ManagedItem
  description: string;
  url: string;
}

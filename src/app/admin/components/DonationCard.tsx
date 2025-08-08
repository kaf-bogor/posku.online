import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { useContext } from 'react';

import { AppContext } from '~/lib/context/app';
import type { DonationPage } from '~/lib/types/donation';
import { formatIDR } from '~/lib/utils/currency';

import ActionSection from './DonationCard/Action';
import ProgressSection from './DonationCard/Progress';
import SummarySection from './DonationCard/Summary';

export default function DonationCard({
  donation,
  preview = false,
  onEdit,
  onDelete,
}: DonationCardProps) {
  const { id, donors, title, summary, target, imageUrls } = donation;

  const { borderColor } = useContext(AppContext);

  const cardBg = useColorModeValue('white', 'gray.800');
  const titleColor = useColorModeValue('gray.800', 'white');

  const calculateProgress = (collected: number, donationTarget: number) => {
    return donationTarget > 0
      ? Math.min((collected / donationTarget) * 100, 100)
      : 0;
  };

  const getTotalCollected = () => {
    return donors?.reduce((total, donor) => total + (donor.value || 0), 0) || 0;
  };

  const progress = calculateProgress(getTotalCollected(), target);

  return (
    <Box
      key={id}
      bg={cardBg}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="xl"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '2xl',
      }}
      border="1px solid"
      borderColor={borderColor}
    >
      <Flex direction={{ base: 'column', md: 'row' }} align="stretch">
        {/* Campaign Image */}
        <Box
          position="relative"
          overflow="hidden"
          w={{ base: '100%', md: '320px' }}
          alignSelf="stretch"
          flexShrink={0}
        >
          <Image
            src={imageUrls?.[0] || ''}
            alt={title}
            w="100%"
            h="100%"
            objectFit="cover"
            transition="transform 0.3s ease"
            _hover={{ transform: 'scale(1.05)' }}
          />

          {/* Progress Overlay */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
            p={4}
          >
            <VStack spacing={2} align="start">
              <Badge
                colorScheme={progress >= 100 ? 'green' : 'blue'}
                variant="solid"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="sm"
                fontWeight="bold"
              >
                {progress.toFixed(0)}% tercapai
              </Badge>
              <Text
                color="white"
                fontSize="lg"
                fontWeight="bold"
                textShadow="0 1px 3px rgba(0,0,0,0.8)"
              >
                {formatIDR(getTotalCollected())}
              </Text>
              <Text
                color="white"
                fontSize="sm"
                opacity={0.9}
                textShadow="0 1px 2px rgba(0,0,0,0.8)"
              >
                dari target {formatIDR(target)}
              </Text>
            </VStack>
          </Box>
        </Box>

        {/* Campaign Content */}
        <VStack
          spacing={5}
          p={6}
          align="stretch"
          flex={1}
          justify="space-between"
        >
          {/* Top Section */}
          <VStack spacing={4} align="stretch">
            {/* Title and Status */}
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between" align="start">
                <Heading
                  as="h3"
                  size="lg"
                  color={titleColor}
                  lineHeight="shorter"
                  fontWeight="bold"
                  flex={1}
                >
                  {title}
                </Heading>
              </HStack>
            </VStack>

            <ProgressSection
              totalCollected={getTotalCollected()}
              target={target}
              progress={progress}
              donors={donors}
            />

            {/* Summary */}
            {!preview && <SummarySection summary={summary} />}
            <ActionSection
              path={`/donasi/${id}`}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </VStack>
        </VStack>
      </Flex>
    </Box>
  );
}

interface DonationCardProps {
  donation: DonationPage;
  preview?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Image,
  Progress,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import DOMPurify from 'dompurify'; // Importing dompurify
import { useContext, useState } from 'react'; // Import useState

import { AppContext } from '~/lib/context/app';
import type { DonationPage } from '~/lib/types/donation';

interface DonationCardProps {
  donation: DonationPage;
  currentAmount: number;
  actionEnabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DonationCard({
  donation,
  currentAmount,
  actionEnabled,
  onEdit,
  onDelete,
}: DonationCardProps) {
  const { title, summary, target, imageUrls } = donation;
  const [isExpanded, setIsExpanded] = useState(false); // New state for toggling summary
  const { textColor, borderColor } = useContext(AppContext);
  const percentage = Math.min((currentAmount / target) * 100, 100).toFixed(0);
  const bg = useColorModeValue('white', 'gray.800');

  const sanitizedSummary = DOMPurify.sanitize(summary);

  return (
    <Box
      bg={bg}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      w="100%"
      border="1px solid"
      borderColor={borderColor}
    >
      <Image
        src={imageUrls[0] || '/placeholder.png'}
        alt={title}
        w="100%"
        h="180px"
        objectFit="cover"
      />

      <Stack spacing={3} p={4}>
        <Heading fontSize="lg">{title}</Heading>

        <Box>
          <Text fontWeight="medium" fontSize="sm" color={textColor}>
            Target: Rp {target.toLocaleString()}
          </Text>
          <Text fontWeight="medium" fontSize="sm" color={textColor}>
            Terkumpul: Rp {currentAmount.toLocaleString()} ({percentage}%)
          </Text>
        </Box>

        <Progress
          colorScheme="teal"
          value={Number(percentage)}
          borderRadius="md"
        />

        <Text
          fontSize="sm"
          color={textColor}
          dangerouslySetInnerHTML={{
            __html: isExpanded
              ? sanitizedSummary
              : `${sanitizedSummary.slice(0, 150)}${sanitizedSummary.length > 150 ? '...' : ''}`,
          }}
        />

        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="link"
          colorScheme="teal"
          size="sm"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </Button>

        <HStack justify="space-between" mt={2}>
          {actionEnabled && (
            <Button colorScheme="teal" size="sm">
              Donasi Sekarang
            </Button>
          )}
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              onClick={onEdit}
            />
            <IconButton
              aria-label="Delete"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              onClick={onDelete}
            />
          </HStack>
        </HStack>
      </Stack>
    </Box>
  );
}

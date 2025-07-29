import {
  Box,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { format, isAfter, isBefore } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

import type { EventItem } from '~/lib/types/event';

interface EventCardProps {
  event: EventItem;
  isCompact?: boolean;
}

const EventCard = ({ event, isCompact = false }: EventCardProps) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');

  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  const getEventStatus = () => {
    if (isBefore(now, startDate)) {
      return { label: 'Upcoming', colorScheme: 'blue' };
    } else if (isAfter(now, endDate)) {
      return { label: 'Ended', colorScheme: 'gray' };
    } else {
      return { label: 'Ongoing', colorScheme: 'green' };
    }
  };

  const status = getEventStatus();

  return (
    <Link href={`/admin/events/${event.id}`} passHref>
      <Box
        as="a"
        bg={cardBg}
        borderRadius="xl"
        overflow="hidden"
        boxShadow="md"
        transition="all 0.3s ease"
        _hover={{
          boxShadow: 'xl',
          transform: 'translateY(-2px)',
        }}
        cursor="pointer"
        w="100%"
        h={isCompact ? "120px" : "auto"}
      >
        {isCompact ? (
          <HStack spacing={0} h="100%">
            {event.imageUrls[0] && (
              <Image
                src={event.imageUrls[0]}
                alt={event.title}
                w="120px"
                h="100%"
                objectFit="cover"
                flexShrink={0}
              />
            )}
            <VStack align="start" spacing={1} p={3} flex={1} h="100%" justify="space-between">
              <VStack align="start" spacing={1} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color={titleColor}
                  lineHeight="short"
                  noOfLines={2}
                >
                  {event.title}
                </Text>
                <HStack spacing={2} fontSize="xs" color={textColor}>
                  <HStack spacing={1}>
                    <Icon as={FaCalendarAlt} />
                    <Text>{format(startDate, 'dd MMM', { locale: id })}</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Icon as={FaMapMarkerAlt} />
                    <Text noOfLines={1}>{event.location}</Text>
                  </HStack>
                </HStack>
              </VStack>
              <HStack justify="space-between" w="100%" align="center">
                <Badge colorScheme={status.colorScheme} size="sm">
                  {status.label}
                </Badge>
                {event.isActive && (
                  <Badge colorScheme="purple" size="sm">
                    Active
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        ) : (
          <VStack spacing={0} align="stretch">
            {event.imageUrls[0] && (
              <Image
                src={event.imageUrls[0]}
                alt={event.title}
                w="100%"
                h="200px"
                objectFit="cover"
              />
            )}
            <VStack align="start" spacing={3} p={4}>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color={titleColor}
                lineHeight="short"
              >
                {event.title}
              </Text>
              <Text fontSize="sm" color={textColor} noOfLines={2}>
                {event.summary}
              </Text>
              <VStack align="start" spacing={2} w="100%">
                <HStack spacing={2} fontSize="sm" color={textColor}>
                  <Icon as={FaCalendarAlt} />
                  <Text>
                    {format(startDate, 'dd MMMM yyyy', { locale: id })} - {format(endDate, 'dd MMMM yyyy', { locale: id })}
                  </Text>
                </HStack>
                <HStack spacing={2} fontSize="sm" color={textColor}>
                  <Icon as={FaMapMarkerAlt} />
                  <Text>{event.location}</Text>
                </HStack>
              </VStack>
              <HStack justify="space-between" w="100%" align="center">
                <Badge colorScheme={status.colorScheme}>
                  {status.label}
                </Badge>
                {event.isActive && (
                  <Badge colorScheme="purple">
                    Active
                  </Badge>
                )}
              </HStack>
            </VStack>
          </VStack>
        )}
      </Box>
    </Link>
  );
};

export default EventCard;

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
import { useEffect, useState, useMemo, useContext } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

import { AppContext } from '../context/app';
import type { EventItem } from '~/lib/types/event';

interface EventCardProps {
  event: EventItem;
  isCompact?: boolean;
}

const EventCard = ({ event, isCompact = false }: EventCardProps) => {
  const { bgColor, textColor } = useContext(AppContext);
  const titleColor = useColorModeValue('gray.800', 'white');

  const [status, setStatus] = useState({
    label: 'Loading',
    colorScheme: 'gray',
  });
  const startDate = useMemo(() => new Date(event.startDate), [event.startDate]);
  const endDate = useMemo(() => new Date(event.endDate), [event.endDate]);

  useEffect(() => {
    const now = new Date();
    const getEventStatus = () => {
      if (isBefore(now, startDate)) {
        return { label: 'Upcoming', colorScheme: 'blue' };
      }

      if (isAfter(now, endDate)) {
        return { label: 'Ended', colorScheme: 'gray' };
      }

      return { label: 'Ongoing', colorScheme: 'green' };
    };

    setStatus(getEventStatus());
  }, [event.startDate, event.endDate, startDate, endDate]);

  return (
    <Link href={`/events/${event.id}`} passHref>
      <Box
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
        h={isCompact ? '120px' : 'auto'}
      >
        <VStack spacing={0} align="stretch" bg={bgColor}>
          {event.imageUrls[0] && (
            <Image
              src={event.imageUrls[0]}
              alt={event.title}
              w="100%"
              h="200px"
              objectFit="cover"
              filter={status.label === 'Ended' ? 'grayscale(100%)' : 'none'}
              transition="filter 0.3s ease"
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
            <VStack align="start" spacing={2} w="100%">
              <HStack spacing={2} fontSize="sm" color={textColor}>
                <Icon as={FaCalendarAlt} />
                <Text>
                  {format(startDate, 'dd MMMM yyyy', { locale: id })}
                  {endDate &&
                    `- ${format(endDate, 'dd MMMM yyyy', { locale: id })}`}
                </Text>
              </HStack>
              <HStack
                spacing={2}
                fontSize="sm"
                color={textColor}
                align="center"
              >
                <Icon as={FaMapMarkerAlt} />
                <Text align="start">{event.location}</Text>
              </HStack>
            </VStack>
            <HStack justify="space-between" w="100%" align="center">
              <Badge colorScheme={status.colorScheme}>{status.label}</Badge>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Link>
  );
};

export default EventCard;

'use client';

import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  Box,
  HStack,
  Avatar,
  Text,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import {
  getOnlineUsers,
  type OnlineStatus,
} from '~/lib/services/presenceService';

const EMPTY: OnlineStatus = { users: [], anonymous: 0 };

export default function OnlineNow() {
  const [status, setStatus] = useState<OnlineStatus>(EMPTY);
  const [open, setOpen] = useState(false);
  const muted = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await getOnlineUsers(5);
      if (active) setStatus(data);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const total = status.users.length + status.anonymous;
  if (total === 0) return null;

  return (
    <Box>
      <Button
        variant="outline"
        size="sm"
        borderRadius="full"
        rightIcon={open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Box w="8px" h="8px" borderRadius="full" bg="green.400" mr={2} />
        {total} sedang online
      </Button>

      {open && (
        <Box mt={3} w="100%">
          {status.users.length > 0 && (
            <HStack spacing={3} flexWrap="wrap">
              {status.users.map((u) => (
                <HStack
                  key={u.uid}
                  spacing={2}
                  borderWidth="1px"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  <Avatar size="sm" name={u.name || u.email} />
                  <Text fontWeight="medium" fontSize="sm">
                    {u.name || u.email}
                  </Text>
                </HStack>
              ))}
            </HStack>
          )}

          {status.anonymous > 0 && (
            <Text color={muted} fontSize="sm" mt={status.users.length ? 3 : 0}>
              {status.anonymous} orang yang belum terdaftar juga online
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}

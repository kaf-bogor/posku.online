'use client';

import { Box, HStack, Avatar, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';

import SectionHeader from '~/lib/components/SectionHeader';
import {
  getOnlineUsers,
  type OnlineUser,
} from '~/lib/services/presenceService';

export default function OnlineNow() {
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const muted = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await getOnlineUsers(5);
      if (active) setOnline(data);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (online.length === 0) return null;

  return (
    <Box>
      <SectionHeader title="Sedang Online" icon={FaUsers} />
      <Text color={muted} fontSize="sm" mb={3}>
        {online.length} pengguna sedang membuka situs.
      </Text>
      <HStack spacing={3} flexWrap="wrap">
        {online.map((u) => (
          <HStack
            key={u.uid}
            spacing={2}
            borderWidth="1px"
            borderRadius="full"
            px={3}
            py={1}
          >
            <Box position="relative">
              <Avatar size="sm" name={u.name || u.email} />
              <Box
                position="absolute"
                bottom="0"
                right="0"
                w="10px"
                h="10px"
                borderRadius="full"
                bg="green.400"
                border="1px solid white"
              />
            </Box>
            <Text fontWeight="medium" fontSize="sm">
              {u.name || u.email}
            </Text>
          </HStack>
        ))}
      </HStack>
    </Box>
  );
}

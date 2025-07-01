'use client';

import {
  Box,
  VStack,
  HStack,
  Image,
  Heading,
  Text,
  Progress,
  Button,
  Input,
  Avatar,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function WakafAtsPage() {
  const [amount, setAmount] = useState('');
  const toast = useToast();

  // Placeholder data
  const campaign = {
    title: 'Wakaf Kelas MAF Poncokusumo',
    image: '/wakaf-kelas-maf.jpg', // Place your image in public folder or use a URL
    summary:
      'Bantu wujudkan kelas baru untuk santri MAF Poncokusumo. Setiap donasi Anda sangat berarti!',
    raised: 37500000,
    target: 100000000,
    donors: 120,
    description: `Penggalangan Dana untuk Pembebasan dan Renovasi Lahan Sekolah Kuttab Al-Fatih Bogor di Jl. Atang Sendjaja, Bogor.`,
    organizer: {
      name: 'Bilistiwa Bogor',
      avatar: '/organizer-avatar.png', // Place your avatar in public or use a URL
      tagline: 'Baitul maal khatulistiwa Kuttab Al-Fatih Bogor',
    },
  };

  const percent = Math.min(
    100,
    Math.round((campaign.raised / campaign.target) * 100)
  );

  const handleDonate = () => {
    if (!amount || Number.isNaN(Number(amount))) {
      toast({
        title: 'Masukkan nominal donasi yang valid.',
        status: 'warning',
        duration: 2000,
      });
      return;
    }
    toast({
      title: `Terima kasih atas donasi sebesar Rp${Number(amount).toLocaleString('id-ID')}!`,
      status: 'success',
      duration: 3000,
    });
    setAmount('');
  };

  return (
    <Box mx="auto" px={2} py={4}>
      {/* Hero Section */}
      <VStack
        spacing={4}
        align="stretch"
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        p={[2, 4]}
      >
        <Image
          src={campaign.image}
          alt={campaign.title}
          borderRadius="md"
          objectFit="cover"
          w="full"
          h={['180px', '260px']}
        />
        <Heading as="h1" size="lg">
          {campaign.title}
        </Heading>
        <Text fontSize="md" color="gray.600">
          {campaign.summary}
        </Text>
        {/* Progress Bar */}
        <Box>
          <HStack justify="space-between">
            <Text fontWeight="bold">
              Rp{campaign.raised.toLocaleString('id-ID')}
            </Text>
            <Text fontSize="sm" color="gray.500">
              dari Rp{campaign.target.toLocaleString('id-ID')}
            </Text>
          </HStack>
          <Progress
            colorScheme="green"
            value={percent}
            borderRadius="md"
            mt={1}
          />
          <Text fontSize="xs" color="green.600" mt={1}>
            {percent}% tercapai • {campaign.donors} Donatur
          </Text>
        </Box>
        {/* Donation Input */}
        <HStack spacing={2}>
          <Input
            type="number"
            placeholder="Nominal Donasi (Rp)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            bg="gray.50"
            maxW="60%"
          />
          <Button colorScheme="green" onClick={handleDonate} flex={1}>
            Donasi Sekarang
          </Button>
        </HStack>
      </VStack>

      {/* Campaign Description with Tabs */}
      <Box mt={8} bg="white" borderRadius="lg" boxShadow="sm" p={[2, 4]}>
        <Heading as="h2" size="md" mb={4}>
          Tentang Program
        </Heading>
        <Tabs variant="enclosed" colorScheme="green">
          <TabList>
            <Tab fontWeight="bold">Tentang</Tab>
            <Tab fontWeight="bold">Laporan</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Text color="gray.700">{campaign.description}</Text>
            </TabPanel>
            <TabPanel>
              <Text color="gray.700">
                Belum ada laporan terbaru. Nantikan update berikutnya.
              </Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Organizer Info */}
      <Box mt={6} bg="white" borderRadius="lg" boxShadow="sm" p={[2, 4]}>
        <Heading as="h3" size="sm" mb={2}>
          Penanggung Jawab
        </Heading>
        <HStack>
          <Avatar
            src={campaign.organizer.avatar}
            name={campaign.organizer.name}
          />
          <Box>
            <Text fontWeight="bold">{campaign.organizer.name}</Text>
            <Text fontSize="sm" color="gray.500">
              {campaign.organizer.tagline}
            </Text>
          </Box>
        </HStack>
      </Box>
    </Box>
  );
}

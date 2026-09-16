'use client';

import {
  VStack,
  Heading,
  Text,
  Spinner,
  Center,
  useColorModeValue,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaHandsHelping } from 'react-icons/fa';

import DonationCard from '../admin/components/DonationCard';
import ContentWrapper from '../components/ContentWrapper';
import { listDonations } from '~/lib/services/donationService';
import type { DonationPage } from '~/lib/types/donation';

const CACHE_KEY = 'amal-campaigns';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function readCache(): DonationPage[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as {
      data: DonationPage[];
      ts: number;
    };
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: DonationPage[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // storage quota exceeded — ignore
  }
}

const AmalPage = () => {
  // Color theme - Must be called first and in consistent order
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('green.500', 'green.400');

  // State hooks
  const [campaigns, setCampaigns] = useState<DonationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Tampilkan cache dulu agar instan, tapi tetap revalidasi ke API supaya
    // perubahan dari admin (aktif/arsip) tidak tertinggal.
    const cached = readCache();
    if (cached) {
      setCampaigns(cached);
      setLoading(false);
    }

    const fetchCampaigns = async () => {
      try {
        setError(null);

        // Ambil semua campaign dari worker D1 (data ternormalisasi), lalu
        // dipisah menjadi amal aktif dan arsip di sisi klien.
        const data = await listDonations();

        writeCache(data);
        setCampaigns(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch donations for /amal', err);
        // Bila cache tersedia, biarkan tampil; hanya tampilkan error tanpa data.
        if (!cached) {
          setCampaigns([]);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.is_active === true),
    [campaigns]
  );
  const archivedCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.is_active !== true),
    [campaigns]
  );

  const renderCampaigns = (items: DonationPage[]) =>
    items.length > 0 ? (
      <VStack spacing={6} align="stretch">
        {items.map((campaign) => (
          <DonationCard key={campaign.id} donation={campaign} />
        ))}
      </VStack>
    ) : (
      <Center py={10}>
        <Text color={textColor}>Belum ada amal pada kategori ini.</Text>
      </Center>
    );

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color="gray.500">Loading...</Text>
        </VStack>
      </Center>
    );
  }

  if (loading) {
    return (
      <ContentWrapper>
        <VStack spacing={6}>
          <IconButton
            aria-label="Kembali"
            icon={<FaArrowLeft />}
            variant="ghost"
            size="sm"
            alignSelf="flex-start"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.back();
              }
            }}
          />
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text color={textColor}>Memuat kampanye Amal...</Text>
        </VStack>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <VStack spacing={6}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color={titleColor}>
              Gagal memuat kampanye Amal
            </Heading>
            <Text color={textColor} maxW="520px">
              {error}
            </Text>
          </VStack>
        </VStack>
      </ContentWrapper>
    );
  }

  if (!campaigns.length) {
    return (
      <ContentWrapper>
        <VStack spacing={6}>
          <VStack spacing={4} textAlign="center">
            <FaHandsHelping fontSize="64px" color={accentColor} />
            <Heading size="lg" color={titleColor}>
              Belum Ada Kampanye Amal
            </Heading>
            <Text color={textColor} maxW="400px">
              Saat ini belum ada kampanye amal yang tersedia. Silakan kembali
              lagi nanti.
            </Text>
          </VStack>
        </VStack>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper withBg={false} withPadding={false}>
      <VStack spacing={6} align="stretch">
        <VStack w="100%" justify="space-between" align="center">
          <Heading
            size="2xl"
            color={titleColor}
            textAlign="center"
            fontWeight="bold"
          >
            Amal
          </Heading>
          <Text color={textColor} fontSize="md" textAlign="center">
            Wujudkan peradaban yang mulia melalui sinergi wakaf, ta’awun, dan
            infaq
          </Text>
        </VStack>

        <Tabs variant="soft-rounded" colorScheme="green" isLazy>
          <TabList>
            <Tab>Amal Aktif ({activeCampaigns.length})</Tab>
            <Tab>Arsip ({archivedCampaigns.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>{renderCampaigns(activeCampaigns)}</TabPanel>
            <TabPanel px={0}>{renderCampaigns(archivedCampaigns)}</TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </ContentWrapper>
  );
};

export default AmalPage;

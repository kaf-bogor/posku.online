'use client';

import {
  Box,
  VStack,
  HStack,
  Stack,
  Image,
  Heading,
  Text,
  Progress,
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  Avatar,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';

import NominalUpdates from '~/app/reports/wakaf_ats/Donors';
import { storageUrl } from '~/lib/context/baseUrl';

export default function WakafAtsPage() {
  const [amount, setAmount] = useState('');
  const [amountNumber, setAmountNumber] = useState<number | null>(null);
  const toast = useToast();

  // Color tokens
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardShadow = useColorModeValue('md', 'dark-lg');
  const inputBg = useColorModeValue('gray.50', 'gray.800');
  const inputText = useColorModeValue('gray.800', 'gray.100');
  const inputAddonBg = useColorModeValue('gray.100', 'gray.600');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const buttonBg = useColorModeValue('green.500', 'green.400');
  const buttonText = useColorModeValue('white', 'gray.900');

  // Placeholder data
  const campaign = {
    title: 'Wakaf Gedung Sekolah Kuttab Al Fatih Bogor',
    media: [
      {
        type: 'video',
        src: 'https://drive.google.com/file/d/1VnuZ8fZfQFJPkm7p7v74pYUOVLfTE3Sq/preview',
        alt: 'Video Wakaf Gedung Sekolah Kuttab Al Fatih Bogor',
      },
      {
        type: 'image',
        src: `${storageUrl}/wakaf_ats%2Fgallery_1.png?alt=media`,
        alt: 'Wakaf Gedung Sekolah Kuttab Al Fatih Bogor',
      },
    ],
    summary:
      'Bantu wujudkan gedung sekolah Kuttab Al Fatih Bogor. Setiap donasi Anda sangat berarti!',
    raised: 0,
    target: 3100000000,
    donors: 120,
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
    if (!amountNumber || Number.isNaN(amountNumber) || amountNumber < 1) {
      toast({
        title: 'Masukkan nominal donasi yang valid.',
        status: 'warning',
        duration: 2000,
      });
      return;
    }
    toast({
      title: `Terima kasih atas donasi sebesar Rp${amountNumber.toLocaleString('id-ID')}!`,
      status: 'success',
      duration: 3000,
    });
    setAmount('');
    setAmountNumber(null);
  };

  // Carousel state moved outside of IIFE to comply with React Hooks rules
  const [carouselIdx, setCarouselIdx] = useState(0);
  const totalMedia = campaign.media.length;
  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIdx((prev) => (prev - 1 + totalMedia) % totalMedia);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIdx((prev) => (prev + 1) % totalMedia);
  };
  const currentMedia = campaign.media[carouselIdx];

  // Format input as Rupiah on change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, ''); // remove non-digits
    if (!raw) {
      setAmount('');
      setAmountNumber(null);
      return;
    }
    const num = parseInt(raw, 10);
    setAmountNumber(num);
    setAmount(num.toLocaleString('id-ID'));
  };

  return (
    <Box mx="auto" px={2} py={4} mb={10}>
      {/* Hero Section */}
      <VStack
        spacing={4}
        align="stretch"
        bg={cardBg}
        borderRadius="lg"
        boxShadow={cardShadow}
        p={[2, 4]}
      >
        {/* Carousel Start */}
        <Box position="relative" w="full" h={['180px', '260px']}>
          {currentMedia.type === 'image' ? (
            <Image
              src={currentMedia.src}
              alt={currentMedia.alt}
              borderRadius="md"
              objectFit="cover"
              w="full"
              h={['180px', '260px']}
            />
          ) : (
            <Box
              w="full"
              h={['180px', '260px']}
              borderRadius="md"
              overflow="hidden"
              bg="black"
            >
              <iframe
                src={currentMedia.src}
                title={currentMedia.alt}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            </Box>
          )}
          {/* Carousel Arrows */}
          {totalMedia > 1 && (
            <>
              <Button
                position="absolute"
                top="50%"
                left={2}
                transform="translateY(-50%)"
                size="sm"
                onClick={goPrev}
                zIndex={2}
                bg="whiteAlpha.800"
                _hover={{ bg: 'white' }}
                borderRadius="full"
                minW={0}
                px={2}
              >
                &#8592;
              </Button>
              <Button
                position="absolute"
                top="50%"
                right={2}
                transform="translateY(-50%)"
                size="sm"
                onClick={goNext}
                zIndex={2}
                bg="whiteAlpha.800"
                _hover={{ bg: 'white' }}
                borderRadius="full"
                minW={0}
                px={2}
              >
                &#8594;
              </Button>
            </>
          )}
          {/* Dots */}
          <HStack
            position="absolute"
            bottom={2}
            left="50%"
            transform="translateX(-50%)"
            spacing={1}
            zIndex={2}
          >
            {campaign.media.map((media, idx) => (
              <Box
                key={`${media.type}-${media.src || idx}`}
                w={2}
                h={2}
                borderRadius="full"
                bg={idx === carouselIdx ? 'green.500' : 'gray.300'}
                cursor="pointer"
                border={idx === carouselIdx ? '2px solid white' : 'none'}
                onClick={() => setCarouselIdx(idx)}
              />
            ))}
          </HStack>
        </Box>
        {/* Carousel End */}
        <Heading as="h1" size="lg" color={headingColor}>
          {campaign.title}
        </Heading>
        <Text fontSize="md" color={textColor}>
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
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={2}
          align="stretch"
          w="full"
        >
          <InputGroup maxW={{ base: '100%', md: '60%' }}>
            <InputLeftAddon
              bg={inputAddonBg}
              fontWeight="bold"
              color={inputText}
            >
              Rp
            </InputLeftAddon>
            <Input
              inputMode="numeric"
              placeholder="Nominal Donasi"
              value={amount}
              onChange={handleAmountChange}
              bg={inputBg}
              color={inputText}
              borderLeftRadius={0}
              _placeholder={{
                color: useColorModeValue('gray.400', 'gray.400'),
              }}
            />
          </InputGroup>
          <Button
            colorScheme="green"
            onClick={handleDonate}
            flex={1}
            bg={buttonBg}
            color={buttonText}
            _hover={{ bg: useColorModeValue('green.600', 'green.500') }}
            p={[2, 0]}
            my={[2, 0]}
          >
            Donasi Sekarang
          </Button>
        </Stack>
      </VStack>

      {/* Campaign Description with Tabs */}
      <Box mt={8} bg="white" borderRadius="lg" boxShadow="sm" p={[2, 4]}>
        <Tabs variant="enclosed" colorScheme="green">
          <TabList>
            <Tab fontWeight="bold" color="gray.700">
              Tentang
            </Tab>
            <Tab fontWeight="bold" color="gray.700">
              Laporan
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box mb={4} color="gray.700">
                <Text fontWeight="bold" mb={2}>
                  Allah Subhanahu Wa Ta&apos;ala berfirman:
                </Text>
                <Text
                  mb={2}
                  fontSize="xl"
                  color="green.800"
                  fontWeight="semibold"
                >
                  وَمَثَلُ ٱلَّذِينَ يُنفِقُونَ أَمۡوَٰلَهُمُ ٱبۡتِغَآءَ
                  مَرۡضَاتِ ٱللَّهِ وَتَثۡبِيتًا مِّنۡ أَنفُسِهِمۡ كَمَثَلِ
                  جَنَّةِۢ بِرَبۡوَةٍ أَصَابَهَا وَابِلٞ فَئَاتَتۡ أُكُلَهَا
                  ضِعۡفَيۡنِ فَإِن لَّمۡ يُصِبۡهَا وَابِلٞ فَطَلّٞ ۗ وَٱللَّهُ
                  بِمَا تَعۡمَلُونَ بَصِيرٌ
                </Text>
                <Text mb={2} fontStyle="italic">
                  &quot;Dan perumpamaan orang yang menginfakkan hartanya untuk
                  mencari ridha Allah dan untuk memperteguh jiwa mereka, seperti
                  sebuah kebun yang terletak di dataran tinggi yang disiram oleh
                  hujan lebat, maka kebun itu menghasilkan buah-buahan dua kali
                  lipat. Jika hujan lebat tidak menyiraminya, maka embun (pun
                  memadai). Allah Maha Melihat apa yang kamu kerjakan.&quot;
                  <br />
                  (QS. Al-Baqarah 2: Ayat 265)
                </Text>
                <Text mb={2}>
                  Salurkan wakaf kita untuk pembebasan lahan dan pembangunan
                  Kuttab Al Fatih Bogor ke:
                </Text>
                <Text fontWeight="bold" color="green.700">
                  BSI WAKAF KUTTAB AL FATIH BOGOR
                  <br />
                  7123309547
                </Text>
                <Text as="i" fontSize="sm" mt={2} display="block">
                  Jazaakumullah ahsanal jazaa kepada segenap wali santri,
                  donatur, Wakif yang sudah menyumbangkan harta, benda, tenaga,
                  pikiran dan waktu demi kelancaran pembebasan dan pembangunan
                  Kuttab Al Fatih Bogor.
                  <br />
                  <br />
                  Semoga apa yang kita wakafkan menjadi wasilah ridho dan
                  keberkahan dari Allah bagi diri kita, keluarga, keturunan dan
                  harta kita semua. Ya Allah, Taqabbal minna.. Terimalah dari
                  kami.. Aamiin Yaa Mujiib
                </Text>
                <Text mt={2}>Bukti Transfer bisa di sampaikan ke WA.</Text>
              </Box>
            </TabPanel>
            <TabPanel>
              <NominalUpdates withHeading={false} donors={[]} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Organizer Info */}
      <Box
        mt={6}
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        p={[2, 4]}
        color="gray.500"
      >
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
            <Text fontSize="sm">{campaign.organizer.tagline}</Text>
          </Box>
        </HStack>
      </Box>
    </Box>
  );
}

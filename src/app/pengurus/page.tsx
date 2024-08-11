import {
  Fade,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const Home = () => {
  return (
    <Fade in>
      <Link href="/">
        <HStack my={6}>
          <FaArrowLeft />
          <Text>Kembali</Text>
        </HStack>
      </Link>
      <Tabs w={['90vw', '400px']}>
        <TabList>
          <Tab>2024</Tab>
          <Tab>2023</Tab>
          <Tab>2022</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Text>Data tidak ditemukan</Text>
          </TabPanel>
          <TabPanel>
            <VStack align="start" gap={6}>
              <VStack align="start" spacing={0}>
                <Text>Ketua : Herry Nugraha / Bairanti</Text>
                <Text>Wk. Ketua : Adi Nurdiansyah / Baidhuri</Text>
              </VStack>
              <VStack align="start">
                <Text>Sekretaris 1 : Dinar / Rangga</Text>
                <Text>Sekretaris 2 : Annisa / Heru Martin</Text>
              </VStack>
              <VStack align="start">
                <Text>Bendahara 1 : Tia / Bimo </Text>
                <Text>Bendahara 2 : Elisa / Muslich</Text>
              </VStack>
              <VStack align="start">
                <Text fontWeight="bold">Bidang Tarbiyah </Text>
                <Text>Ketua : Samsam Nurhidayat</Text>
                <Text>Wakil : Achmad Syaefillah</Text>
              </VStack>
              <VStack align="start">
                <Text fontWeight="bold">Bidang Ukhuwah</Text>
                <Text>Ketua: Pinto Jaya</Text>
                <Text>Wakil: Wan Yoga</Text>
              </VStack>
            </VStack>
          </TabPanel>
          <TabPanel>
            <Text>Data tidak ditemukan</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Fade>
  );
};

export default Home;

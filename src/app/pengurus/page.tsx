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

const PengurusPage = () => {
  return (
    <Fade in>
      <Link href="/">
        <HStack my={6}>
          <FaArrowLeft />
          <Text>Kembali</Text>
        </HStack>
      </Link>
      <Tabs w={['90vw', 'full']}>
        <TabList>
          <Tab>2024</Tab>
          <Tab>2023</Tab>
          <Tab>2022</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack align="start" gap={6}>
              <VStack align="start" spacing={0}>
                <Text>Ketua : Bimo R. Samudro / Tia Restyani</Text>
              </VStack>
              <VStack align="start">
                <Text>Sekretaris 1 : Heru Martin / Annisa</Text>
                <Text>Sekretaris 2 : Rindio Santoso / Imas Widya</Text>
              </VStack>
              <VStack align="start">
                <Text>Bendahara 1 : Girinda Wardhana / Widya</Text>
                <Text>Bendahara 2 : Ronny Yerrie / Sasti Ambarawati N.</Text>
              </VStack>
              <VStack align="start">
                <Text>
                  Media : Rifki Fauzi / Muhlis Prasetyo / Nurlika Cahyani
                </Text>
              </VStack>
              <VStack align="start">
                <Text fontWeight="bold">Divisi Tarbiyah</Text>
                <Text>Ketua : Samsam Nurhidayat</Text>
                <Text>KBO : Febriandy P. H., Adam Lubis</Text>
                <Text>Umum : Dede Mukhtar, Rajab</Text>
                <Text>Kajian Qowamah : Septian A. W.</Text>
                <Text>Tahsin Qowamah : Achmad Syaefillah</Text>
                <Text>
                  Kajian Ummahat : Asti, Nunik, Lintang, Finny, Jati, Erna ,
                  Septiana Destri, Mardiyyah
                </Text>
                <Text>
                  Kajian Ummahat : Asti, Nunik, Lintang, Finny, Jati, Erna,
                  Yuyun
                </Text>
                <Text>
                  Tahsin Ummahat : Ghia, Noor Baity, Yayah, Destri, Evi Y
                </Text>
              </VStack>
              <VStack align="start">
                <Text fontWeight="bold">Divisi Ukhuwah</Text>
                <Text>Ketua : Wan Yoga, Pinto Jaya</Text>
                <Text>Qowamah Center : Helman Wijaya, Ridwan, Suhardiman</Text>
                <Text>Muslimah Center : Miska, Ratna</Text>
                <Text>Sentra Literasi Ilmu : Leni Melvita, Yuliana</Text>
                <Text>Sentra Sehat : Noor Baity, Tiani, Kinta</Text>
                <Text>Sentra Bugar : Rety, Yuyun, Dewi </Text>
                <Text>Sentra Kreatif : Puji</Text>
              </VStack>
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack align="start" gap={6}>
              <VStack align="start" spacing={0}>
                <Text>Ketua : Herry Nugraha, Bairanti</Text>
                <Text>Wk. Ketua : Adi Nurdiansyah, Baidhuri</Text>
              </VStack>
              <VStack align="start">
                <Text>Sekretaris 1 : Dinar, Rangga</Text>
                <Text>Sekretaris 2 : Annisa, Heru Martin</Text>
              </VStack>
              <VStack align="start">
                <Text>Bendahara 1 : Tia, Bimo </Text>
                <Text>Bendahara 2 : Elisa, Muslich</Text>
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
            <Text>Ketua: Haris Dini, Bude </Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Fade>
  );
};

export default PengurusPage;

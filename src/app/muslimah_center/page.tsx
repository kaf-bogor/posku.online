'use client';

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Heading,
  Link,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

const sentras = [
  {
    title: 'Sentra Bugar',
    linkTitle: 'Yuyun',
    link: 'https://wa.me/6285717474897',
    description:
      'Sentra Bugar di Muslimah Center menyediakan berbagai aktivitas untuk menjaga kesehatan dan kebugaran para ummahat. Salah satu kegiatannya adalah Pilates, yaitu olahraga peregangan dan latihan penguatan otot tanpa musik yang dilakukan secara rutin dua kali sepekan. Selain itu, tersedia juga kegiatan Trekking, yang merupakan agenda insidental setiap dua bulan sekali di area bukit atau curug sekitar Sentul. Kegiatan ini bertujuan untuk menyegarkan pikiran, mempererat ukhuwah, serta menjadi ikhtiar menjaga vitalitas dan kesehatan tubuh.',
  },
  {
    title: 'Sentra Kreatif',
    linkTitle: 'Puji',
    link: 'https:/wa.me/6281298545347',
    description:
      'Sentra Kreatif di Muslimah Center menjadi ruang bagi para ummahat untuk menyalurkan kreativitas dan keterampilan mereka. Salah satu programnya adalah Cooking Class, yang tidak hanya memperkuat ukhuwah tetapi juga menjadi ajang berbagi keterampilan memasak dengan sajian halal dan thayib. Selain itu, tersedia juga kegiatan Merajut, sebuah aktivitas produktif yang telah berjalan secara rutin dan menjadi salah satu bentuk ekspresi seni serta keterampilan tangan di komunitas Muslimah Center.',
  },
  {
    title: 'Sentra Literasi',
    linkTitle: 'Leni M',
    link: 'https://wa.me/6282161155548',
    description:
      'Sentra Literasi di Muslimah Center hadir sebagai wadah untuk meningkatkan wawasan dan kecintaan terhadap ilmu dengan berbagai kegiatan bermanfaat. Tersedia perpustakaan yang menyediakan buku Tafsir, Siroh, serta buku anak yang dapat dipinjam untuk menambah pengetahuan keluarga. Selain itu, diadakan Kajian Parenting Nabawiyah bersama Ustadz Elvin Sasmita, S. Kom., yang membahas pola asuh sesuai dengan nilai-nilai Islam. Tak hanya itu, terdapat juga kelompok belajar Nais Umma yang menjadi ruang diskusi bagi para ibu untuk bertukar wawasan dan pengalaman dalam mendidik anak dan membangun keluarga yang harmonis.',
  },

  {
    title: 'Sentra Sehat',
    linkTitle: 'contact',
    link: 'https://wa.me/6289611370734',
    description:
      'Sentra Sehat di Muslimah Center hadir untuk mendukung kesehatan ibu, anak, dan keluarga melalui berbagai layanan pemeriksaan dan konsultasi. Tersedia pemeriksaan kesehatan khusus untuk ibu hamil, menyusui, serta anak-anak setiap Senin pukul 08.00-10.00 WIB di ruang musollah, yang ditangani oleh bidan, konselor laktasi, dan konselor gizi berpengalaman. Selain itu, Muslimah Center juga menyediakan layanan Konsultasi Dokter yang dapat dilakukan secara offline maupun online dengan berbagai spesialisasi, termasuk dokter umum, dokter anak, dokter hewan, dokter saraf, dan dokter gigi. Dengan adanya layanan ini, diharapkan para ummahat dapat lebih mudah mengakses informasi dan solusi kesehatan yang dibutuhkan bagi keluarga mereka.',
  },
];

const MuslimahCenterPage = () => {
  const accordionBg = useColorModeValue('gray.100', 'gray.700');
  const accordionHoverBg = useColorModeValue('gray.200', 'gray.600');
  const accordionExpandedBg = useColorModeValue('teal.100', 'teal.600');
  const accordionExpandedColor = useColorModeValue('black', 'white');

  return (
    <VStack spacing={8} mt={8} px={4} maxW="600px" mx="auto">
      <VStack spacing={2} textAlign="center">
        <Heading size="xl">Muslimah Center</Heading>
        <Text fontSize="md">
          Klik tautan di bawah untuk menghubungi contact person setiap sentra.
        </Text>
      </VStack>

      <Accordion allowMultiple w={['full', '450px']}>
        {sentras.map((sentra) => (
          <AccordionItem key={sentra.title}>
            <h2>
              <AccordionButton
                py={4}
                bg={accordionBg}
                _hover={{ bg: accordionHoverBg }}
                _expanded={{
                  bg: accordionExpandedBg,
                  color: accordionExpandedColor,
                }}
              >
                <Box flex="1" textAlign="left" fontWeight="bold">
                  {sentra.title}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text fontSize="sm">{sentra.description}</Text>
              {sentra.linkTitle && (
                <Link href={sentra.link} isExternal>
                  <Button mt={4} w="full" colorScheme="teal">
                    Hubungi ({sentra.linkTitle})
                  </Button>
                </Link>
              )}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </VStack>
  );
};

export default MuslimahCenterPage;

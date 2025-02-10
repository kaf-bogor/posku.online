import { Box, SimpleGrid, Image, Text, Link, HStack } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';

export default function Page() {
  const baseUrl =
    'https://firebasestorage.googleapis.com/v0/b/posku-76e08.appspot.com/o/';
  const emptythumb = 'empty_thumb.png?alt=media';
  const data = [
    {
      order: 1,
      image_url: '2024%2Fagustus%2Fagustus_thumb.png?alt=media',
      title: 'Agustus 2024',
      document_url: '2024%2Fagustus%2Fnewsletter_agustus24.pdf?alt=media',
    },
    {
      order: 2,
      image_url: '2024%2Fjuli%2Fjuli_thumb.png?alt=media',
      title: 'Juli 2024',
      document_url: '2024%2Fjuli%2Fnewsletter_juli24.pdf?alt=media',
    },
    {
      order: 3,
      image_url: emptythumb,
      title: 'Agustus 2024',
      document_url: null,
    },
    {
      order: 4,
      image_url: '2024%2Fseptember%2Fsep_thumb.png?alt=media',
      title: 'September 2024',
      document_url: 'https://online.fliphtml5.com/oquoev/daoo/#p=1',
    },
    {
      order: 5,
      image_url: '2024%2Foktober%2Fokt_thumb.png?alt=media',
      title: 'Oktober 2024',
      document_url: 'https://online.fliphtml5.com/oquoev/egyj/#p=1',
    },
    {
      order: 6,
      image_url: emptythumb,
      title: 'November 2024',
      document_url: null,
    },
    {
      order: 7,
      image_url: emptythumb,
      title: 'Desember 2024',
      document_url: null,
    },
    {
      order: 8,
      image_url: 'jan_2025.png?alt=media',
      title: 'Januari 2025',
      document_url: 'https://online.fliphtml5.com/oquoev/htae/',
    },
  ];

  return (
    <Box w="full">
      <Link href="/">
        <HStack my={6}>
          <FaArrowLeft />
          <Text>Kembali</Text>
        </HStack>
      </Link>
      <SimpleGrid columns={[1, 1, 3]} spacing={6}>
        {[...data]
          .sort((a, b) => b.order - a.order)
          .map((item) => (
            <Box
              key={item.order}
              borderWidth={1}
              borderRadius="lg"
              overflow="hidden"
            >
              <Image
                src={`${baseUrl}${item.image_url}`}
                alt={item.title}
                objectFit="cover"
                boxSize="100%"
                height={['400px', '400px', '300px']}
              />
              <Box p={4}>
                <Text fontWeight="bold" fontSize="xl" mb={2}>
                  {item.title}
                </Text>
                {item.document_url ? (
                  <Link
                    href={
                      item.document_url.startsWith('https')
                        ? item.document_url
                        : `${baseUrl}${item.document_url}`
                    }
                    isExternal
                    color="blue.500"
                  >
                    Lihat dokumen
                  </Link>
                ) : (
                  'Tidak terbit'
                )}
              </Box>
            </Box>
          ))}
      </SimpleGrid>
    </Box>
  );
}

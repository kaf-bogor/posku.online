import { Box, SimpleGrid, Image, Text, Link, HStack } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';

import { firebaseUrl } from '~/lib/context/baseUrl';
import newsletters from '~/lib/data/newsletter.json';

export default function Page() {
  return (
    <Box w="full">
      <Link href="/">
        <HStack my={6}>
          <FaArrowLeft />
          <Text>Kembali</Text>
        </HStack>
      </Link>
      <SimpleGrid columns={[1, 1, 3]} spacing={6}>
        {[...newsletters]
          .sort((a, b) => b.order - a.order)
          .map((item) => (
            <Box
              key={item.order}
              borderWidth={1}
              borderRadius="lg"
              overflow="hidden"
            >
              <Image
                src={`${firebaseUrl}${item.image_url}`}
                alt={item.title}
                objectFit="contain"
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
                        : `${firebaseUrl}${item.document_url}`
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

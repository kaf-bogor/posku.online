import { Box, SimpleGrid, Image, Text, Link } from '@chakra-ui/react';

import ContentWrapper from '~/app/components/ContentWrapper';
import newsletterSeed from '~/lib/data/newsletter.json';
import { resolveStorageUrl } from '~/lib/utils/newsletter';

export const dynamic = 'force-dynamic';

type NewsletterItem = {
  id?: string;
  order: number;
  title: string;
  image_url: string;
  document_url: string | null;
};

async function getNewsletters(): Promise<NewsletterItem[]> {
  return newsletterSeed as NewsletterItem[];
}

export default async function Page() {
  const newsletters = await getNewsletters();

  return (
    <ContentWrapper>
      <SimpleGrid columns={[1, 1, 3]} spacing={6}>
        {[...newsletters]
          .sort((a, b) => b.order - a.order)
          .map((item) => (
            <Box
              key={item.id ?? `${item.order}-${item.title}`}
              borderWidth={1}
              borderRadius="lg"
              overflow="hidden"
            >
              <Image
                src={resolveStorageUrl(item.image_url)}
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
                    href={resolveStorageUrl(item.document_url)}
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
    </ContentWrapper>
  );
}

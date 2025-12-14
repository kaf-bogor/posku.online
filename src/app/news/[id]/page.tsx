'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Image,
  Button,
  Icon,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Head from 'next/head';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';

import CommentsSection from '~/lib/components/CommentsSection';
import { db } from '~/lib/firebase';
import type { NewsItem } from '~/lib/types/news';

export default function NewsDetailPage() {
  const { id: slug } = useParams<{ id: string }>();
  const router = useRouter();

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const dateFormat = 'dd MMMM yyyy';

  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return undefined;

    const newsRef = collection(db, 'news');
    const q = query(newsRef, where('slug', '==', slug));

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data() as Omit<NewsItem, 'id'>;
        setNews({ id: doc.id, ...data });
      } else {
        setNews(null);
      }
      setLoading(false);
    });

    return () => {
      unsub();
    };
  }, [slug]);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  if (!news) {
    return (
      <VStack spacing={4} align="center" p={8}>
        <Heading size="md">Berita tidak ditemukan</Heading>
        <Button onClick={() => router.push('/news')}>Kembali ke daftar</Button>
      </VStack>
    );
  }

  const newsUrl = `https://poskubogor.com/news/${news.slug}`;
  const newsImage = news.imageUrls?.[0] || '/default-news-image.jpg';
  const newsDescription = news.summary.substring(0, 160);

  return (
    <>
      <Head>
        <title>{news.title} - Posku Bogor</title>
        <meta name="description" content={newsDescription} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={newsUrl} />
        <meta property="og:title" content={news.title} />
        <meta property="og:description" content={newsDescription} />
        <meta property="og:image" content={newsImage} />
        <meta property="og:site_name" content="Posku Bogor" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={newsUrl} />
        <meta name="twitter:title" content={news.title} />
        <meta name="twitter:description" content={newsDescription} />
        <meta name="twitter:image" content={newsImage} />

        {/* Additional metadata */}
        <meta property="og:locale" content="id_ID" />
        <meta property="article:published_time" content={news.publishDate} />
        <meta property="article:author" content={news.author} />
      </Head>
      <VStack spacing={6} align="stretch" w="100%" p={0}>
        <HStack justify="space-between" align="center">
          <Heading size="lg" color={titleColor}>
            {news.title}
          </Heading>
          <HStack>
            {news.isPublished && <Badge colorScheme="green">Published</Badge>}
          </HStack>
        </HStack>

        {news.imageUrls?.[0] && (
          <Box
            bg={cardBg}
            borderRadius="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Image
              src={news.imageUrls[0]}
              alt={news.title}
              w="100%"
              h={{ base: '220px', md: '320px' }}
              objectFit="cover"
            />
          </Box>
        )}

        <Box
          bg={cardBg}
          borderRadius="xl"
          p={4}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack align="start" spacing={3}>
            <HStack spacing={3} color={textColor} fontSize="sm">
              <Icon as={FaCalendarAlt} />
              <Text>
                {format(new Date(news.publishDate), dateFormat, {
                  locale: localeID,
                })}
              </Text>
            </HStack>
            <HStack spacing={3} color={textColor} fontSize="sm">
              <Icon as={FaUser} />
              <Text>{news.author}</Text>
            </HStack>
            <Text color={textColor} whiteSpace="pre-wrap">
              {news.summary}
            </Text>
          </VStack>
        </Box>

        {news.imageUrls?.length > 1 && (
          <VStack align="stretch" spacing={3}>
            <Heading size="sm">Galeri</Heading>
            <HStack spacing={3} overflowX="auto">
              {news.imageUrls.slice(1).map((url) => (
                <Image
                  key={url}
                  src={url}
                  alt={news.title}
                  h="120px"
                  objectFit="cover"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                />
              ))}
            </HStack>
          </VStack>
        )}

        {/* Comments Section */}
        <Box>
          <CommentsSection resourceType="news" resourceId={news.id} />
        </Box>

        <Link href="/news" passHref>
          <Button as="a" variant="ghost" alignSelf="start">
            Kembali ke semua berita
          </Button>
        </Link>
      </VStack>
    </>
  );
}

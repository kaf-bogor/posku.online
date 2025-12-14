'use client';

import {
  VStack,
  Heading,
  Spinner,
  Text,
  useToast,
  Input,
  Textarea,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
} from '@chakra-ui/react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';

import ManagerForm from '~/app/admin/ManagerForm';
import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import type { NewsItem } from '~/lib/types/news';
import { generateSlug } from '~/lib/utils/slug';

const ADMIN_NEWS_PATH = '/admin/news';

export default function EditNewsPage() {
  const router = useRouter();
  const toast = useToast();
  const { bgColor } = useContext(AppContext);
  const { id: paramsId } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<NewsItem, 'id'> | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!paramsId) return;
      try {
        const snap = await getDoc(doc(db, 'news', paramsId));
        if (snap.exists()) {
          const data = snap.data() as NewsItem;
          const { id, ...rest } = data;
          setForm(rest);
        } else {
          toast({
            title: 'Not found',
            description: 'News not found.',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          router.push(ADMIN_NEWS_PATH);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to fetch news.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        router.push(ADMIN_NEWS_PATH);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [paramsId, router, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !paramsId) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'news', paramsId), form);
      toast({
        title: 'Success',
        description: 'News updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(ADMIN_NEWS_PATH);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to update news.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !form) {
    return (
      <HStack justify="center" py={20}>
        <Spinner />
        <Text>Loading news...</Text>
      </HStack>
    );
  }

  return (
    <VStack align="stretch" spacing={4} bg={bgColor} p={4}>
      <Heading size="md">Edit News</Heading>

      <ManagerForm
        formState={form}
        onSubmit={handleSave}
        onCancel={() => router.push(ADMIN_NEWS_PATH)}
        title="Edit News"
        isEdit
      >
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            name="title"
            value={form.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setForm({
                ...form,
                title: newTitle,
                slug: generateSlug(newTitle),
              });
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Slug</FormLabel>
          <Input
            name="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="url-friendly-slug"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Summary</FormLabel>
          <Textarea
            name="summary"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Publish Date</FormLabel>
          <Input
            type="date"
            name="publishDate"
            value={form.publishDate.split('T')[0]}
            onChange={(e) =>
              setForm({
                ...form,
                publishDate: new Date(e.target.value).toISOString(),
              })
            }
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Author</FormLabel>
          <Input
            name="author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <Checkbox
            isChecked={form.isPublished}
            onChange={(e) =>
              setForm({
                ...form,
                isPublished: e.target.checked,
              })
            }
          >
            Published
          </Checkbox>
        </FormControl>
      </ManagerForm>
    </VStack>
  );
}

'use client';

import {
  VStack,
  Heading,
  Spinner,
  Text,
  useToast,
  Input,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
} from '@chakra-ui/react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';

import ManagerForm from '~/app/admin/ManagerForm';
import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import type { EventItem } from '~/lib/types/event';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ADMIN_EVENT_PATH = '/admin/events';

export default function EditEventPage() {
  const router = useRouter();
  const toast = useToast();
  const { bgColor } = useContext(AppContext);
  const { id: paramsId } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<EventItem, 'id'> | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!paramsId) return;
      try {
        const snap = await getDoc(doc(db, 'events', paramsId));
        if (snap.exists()) {
          const data = snap.data() as EventItem;
          const { id, ...rest } = data;
          setForm(rest);
        } else {
          toast({
            title: 'Not found',
            description: 'Event not found.',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          router.push(ADMIN_EVENT_PATH);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to fetch event.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        router.push(ADMIN_EVENT_PATH);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [paramsId, router, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !paramsId) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'events', paramsId), form);
      toast({
        title: 'Success',
        description: 'Event updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(ADMIN_EVENT_PATH);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to update event.',
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
        <Text>Loading event...</Text>
      </HStack>
    );
  }

  return (
    <VStack align="stretch" spacing={4} bg={bgColor} p={4}>
      <Heading size="md">Edit Event</Heading>

      <ManagerForm
        formState={form}
        onSubmit={handleSave}
        onCancel={() => router.push(ADMIN_EVENT_PATH)}
        title="Edit Event"
        isEdit
      >
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Summary</FormLabel>
          <ReactQuill
            theme="snow"
            value={form.summary}
            onChange={(value) => setForm({ ...form, summary: value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Start Date</FormLabel>
          <Input
            type="date"
            name="startDate"
            value={form.startDate.split('T')[0]}
            onChange={(e) =>
              setForm({
                ...form,
                startDate: new Date(e.target.value).toISOString(),
              })
            }
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>End Date</FormLabel>
          <Input
            type="date"
            name="endDate"
            value={form.endDate.split('T')[0]}
            onChange={(e) =>
              setForm({
                ...form,
                endDate: new Date(e.target.value).toISOString(),
              })
            }
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Location</FormLabel>
          <Input
            name="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <Checkbox
            isChecked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          >
            Active
          </Checkbox>
        </FormControl>
      </ManagerForm>
    </VStack>
  );
}

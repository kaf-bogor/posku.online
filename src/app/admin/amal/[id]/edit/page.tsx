'use client';

import {
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Input,
  Switch,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  VStack,
  Box,
  List,
  ListItem,
  Text,
  Badge,
  Progress,
  useToast,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import type React from 'react';

import FormImagePreview from '~/app/admin/components/FormImagePreview';
import ManagerForm from '~/app/admin/ManagerForm';
import DonorsFormSection from '~/app/admin/ManagerForm/DonorsForm';
import OrganizerFormSection from '~/app/admin/ManagerForm/OrganizerForm';
import { AppContext } from '~/lib/context/app';
import {
  getAdminToken,
  getDonation,
  updateDonation,
} from '~/lib/services/donationService';
import type { Activity, DonationPage } from '~/lib/types/donation';
import { formatIDR } from '~/lib/utils/currency';
import { generateSlug } from '~/lib/utils/slug';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const DonationDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const toast = useToast();

  const [donation, setDonation] = useState<DonationPage | null>(null);
  const [editForm, setEditForm] = useState<DonationPage | null>(null);
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { bgColor, textColor, borderColor } = useContext(AppContext);

  useEffect(() => {
    if (!id) return;
    const fetchDonation = async () => {
      const data = await getDonation(id);
      if (data) {
        setDonation(data);
        setEditForm(data);
      }
    };
    fetchDonation();
  }, [id]);

  const uploadImagesToServer = async (files: File[], category: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('category', category);
    const response = await fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload images');
    }

    const data = await response.json();
    return data.imageUrls as string[];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !donation) return;
    setIsSaving(true);
    try {
      const token = await getAdminToken();
      if (!token) throw new Error('Anda harus login sebagai admin');

      let { imageUrls } = editForm;
      if (editSelectedFiles.length > 0) {
        const newImageUrls = await uploadImagesToServer(
          editSelectedFiles,
          'donation'
        );
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      await updateDonation(token, donation.id, {
        slug: editForm.slug,
        title: editForm.title,
        summary: editForm.summary,
        target: editForm.target,
        link: editForm.link,
        imageUrls,
        order: editForm.order,
        published: editForm.published,
        is_active: editForm.is_active,
        organizer: editForm.organizer,
      });

      toast({
        title: 'Sukses',
        description: 'Kampanye amal berhasil diperbarui.',
        status: 'success',
        duration: 3000,
      });
      setEditSelectedFiles([]);
      const refreshed = await getDonation(donation.id);
      if (refreshed) {
        setDonation(refreshed);
        setEditForm(refreshed);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating donation:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setEditSelectedFiles(Array.from(e.target.files));
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (editForm) setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditNumberChange = (value: string) => {
    if (editForm) setEditForm({ ...editForm, target: Number(value) });
  };

  if (donation === null) {
    return <div>Loading...</div>;
  }

  const currentAmount =
    donation.donors?.reduce((acc, donor) => acc + (donor.value || 0), 0) || 0;
  const percentage = Math.min(
    (currentAmount / donation.target) * 100,
    100
  ).toFixed(0);

  return (
    <ManagerForm
      isEdit
      title={`Edit: ${donation.title}`}
      formState={editForm}
      isLoading={isSaving}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/admin/amal')}
    >
      <Tabs variant="soft-rounded" isFitted>
        <TabList>
          <Tab color={textColor}>Laporan</Tab>
          <Tab color={textColor}>Donation Details</Tab>
          <Tab color={textColor}>Aktivitas</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box bg={bgColor} p={3} color={textColor}>
              {formatIDR(currentAmount)} dari {formatIDR(donation.target)} •{' '}
              {donation.donors?.reduce(
                (acc, donor) => acc + (Number(donor.donorsCount) || 1),
                0
              ) || 0}{' '}
              Donatur
              <Flex align="center" mb={2}>
                <Progress
                  value={Number(percentage)}
                  size="sm"
                  flex="1"
                  borderRadius="sm"
                  colorScheme="blue"
                  mr={2}
                />
                <Text fontSize="sm" minW="45px" textAlign="right">
                  {percentage}%
                </Text>
              </Flex>
            </Box>
            <DonorsFormSection
              donors={donation.donors || []}
              donationId={donation.id}
            />
          </TabPanel>
          <TabPanel>
            <VStack
              gap={6}
              mt={4}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
              bg={bgColor}
            >
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={editForm?.title}
                  onChange={(e) => {
                    if (editForm)
                      setEditForm({
                        ...editForm,
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Slug</FormLabel>
                <Input
                  name="slug"
                  value={editForm?.slug ?? ''}
                  onChange={(e) => {
                    if (editForm)
                      setEditForm({ ...editForm, slug: e.target.value });
                  }}
                  placeholder="auto-generated from title"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Summary</FormLabel>
                <ReactQuill
                  theme="snow"
                  value={editForm?.summary}
                  onChange={(value) => {
                    handleEditFormChange({
                      target: {
                        name: 'summary',
                        value,
                      },
                    } as React.ChangeEvent<HTMLTextAreaElement>);
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Target (Rp)</FormLabel>
                <NumberInput
                  value={editForm?.target}
                  min={0}
                  onChange={handleEditNumberChange}
                >
                  <NumberInputField name="target" />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Link</FormLabel>
                <Input
                  name="link"
                  value={editForm?.link}
                  onChange={handleEditFormChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Aktif</FormLabel>
                <Switch
                  isChecked={editForm?.is_active}
                  onChange={(e) => {
                    if (editForm)
                      setEditForm({ ...editForm, is_active: e.target.checked });
                  }}
                />
              </FormControl>

              <FormControl isRequired={donation.imageUrls.length === 0}>
                <FormLabel>Images</FormLabel>
                <Input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleEditFileChange}
                />

                <HStack mt={2} spacing={2} wrap="wrap">
                  {(editForm?.imageUrls ?? []).map((imageUrl, index) => (
                    <FormImagePreview
                      key={imageUrl}
                      imageUrl={imageUrl}
                      onRemoveImage={() => {
                        if (editForm) {
                          const updatedImageUrls = editForm.imageUrls.filter(
                            (_, i) => i !== index
                          );
                          setEditForm({
                            ...editForm,
                            imageUrls: updatedImageUrls,
                          });
                        }
                      }}
                    />
                  ))}

                  {editSelectedFiles.map((file, index) => (
                    <FormImagePreview
                      key={file.name}
                      imageUrl={URL.createObjectURL(file)}
                      onRemoveImage={() => {
                        const updatedFiles = editSelectedFiles.filter(
                          (_, i) => i !== index
                        );
                        setEditSelectedFiles(updatedFiles);
                      }}
                    />
                  ))}
                </HStack>
              </FormControl>
            </VStack>
            <OrganizerFormSection
              organizer={donation.organizer}
              onFormChange={handleEditFormChange}
            />
          </TabPanel>
          <TabPanel>
            {/* Activities Panel */}
            <Box mt={6} p={4} bg={bgColor} color={textColor}>
              {donation.activities && donation.activities.length > 0 ? (
                <List spacing={3} maxH="300px" overflowY="auto">
                  {donation.activities
                    .slice()
                    .sort(
                      (a: Activity, b: Activity) =>
                        new Date(b.datetime).getTime() -
                        new Date(a.datetime).getTime()
                    )
                    .map((act: Activity) => (
                      <ListItem
                        key={act.datetime + act.type + act.description}
                        borderBottomWidth="1px"
                        pb={2}
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="bold">
                            {act.userName ?? 'Unknown'}{' '}
                            <Badge colorScheme="purple">{act.type}</Badge>
                          </Text>
                          <Text fontSize="sm">{act.description}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(act.datetime).toLocaleString('id-ID')}
                          </Text>
                        </VStack>
                      </ListItem>
                    ))}
                </List>
              ) : (
                <Text>Tidak ada aktivitas.</Text>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ManagerForm>
  );
};

export default DonationDetailPage;

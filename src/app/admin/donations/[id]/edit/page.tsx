'use client';

import {
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Input,
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
} from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import type React from 'react';

import FormImagePreview from '~/app/admin/components/FormImagePreview';
import ManagerForm from '~/app/admin/ManagerForm';
import DonorsFormSection from '~/app/admin/ManagerForm/DonorsForm';
import OrganizerFormSection from '~/app/admin/ManagerForm/OrganizerForm';
import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase'; // adjust the import path to your firebase config
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import type { Activity, DonationPage } from '~/lib/types/donation';
import { initialDonationState } from '~/lib/types/donation';
import { formatIDR } from '~/lib/utils/currency';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const DonationDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();

  const [donation, setDonation] = useState<DonationPage | null>(null);
  const { bgColor, textColor, borderColor } = useContext(AppContext);

  const {
    editForm,
    setEditForm,
    editSelectedFiles,
    setEditSelectedFiles,
    handleCancelEdit,
    handleSaveEdit,
  } = useCrudManager<DonationPage>({
    collectionName: 'donations',
    blobFolderName: 'donation',
    itemSchema: initialDonationState,
  });

  useEffect(() => {
    if (!id) return;
    const fetchDonation = async () => {
      const docRef = doc(db, 'donations', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDonation({ id: docSnap.id, ...docSnap.data() } as DonationPage);
        setEditForm({ id: docSnap.id, ...docSnap.data() } as DonationPage);
      }
    };
    fetchDonation();
  }, [id, setEditForm]);

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
      onSubmit={(e) =>
        handleSaveEdit(e, donation.id, () => router.push(`/admin/donations`))
      }
      onCancel={handleCancelEdit}
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
                  onChange={handleEditFormChange}
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
                  {/* Display existing images and new files */}
                  {donation.imageUrls.map((imageUrl, index) => (
                    <FormImagePreview
                      imageUrl={imageUrl}
                      onRemoveImage={() => {
                        const updatedImageUrls = donation.imageUrls.filter(
                          (_, i) => i !== index
                        );
                        handleEditFileChange({
                          target: {
                            name: 'imageUrls',
                            value: updatedImageUrls.join(','),
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                    />
                  ))}

                  {/* Display newly selected files */}
                  {editSelectedFiles.map((file, index) => (
                    <FormImagePreview
                      imageUrl={URL.createObjectURL(file)}
                      onRemoveImage={() => {
                        const updatedImageUrls = editSelectedFiles.filter(
                          (_, i) => i !== index
                        );
                        handleEditFileChange({
                          target: {
                            name: 'imageUrls',
                            value: updatedImageUrls.join(','),
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
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
                        key={act.datetime}
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

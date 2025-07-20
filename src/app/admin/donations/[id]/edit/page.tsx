'use client';

import {
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type React from 'react';

import FormImageFilePreview from '~/app/admin/components/FormImageFilePreview';
import FormImagePreview from '~/app/admin/components/FormImagePreview';
import ManagerForm from '~/app/admin/ManagerForm';
import DonorsFormSection from '~/app/admin/ManagerForm/DonorsForm';
import OrganizerFormSection from '~/app/admin/ManagerForm/OrganizerForm';
import { db } from '~/lib/firebase'; // adjust the import path to your firebase config
import { useCrudManager } from '~/lib/hooks/useCrudManager';
import { initialDonationState, type DonationPage } from '~/lib/types/donation';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const DonationDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const [donation, setDonation] = useState<DonationPage | null>(null);

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

  return (
    <ManagerForm
      isEdit
      title={`Edit: ${donation.title}`}
      formState={editForm}
      onSubmit={(e) => handleSaveEdit(e, donation.id)}
      onCancel={handleCancelEdit}
    >
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Laporan</Tab>
          <Tab>Donation Details</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {/* Donors Section */}
            <DonorsFormSection
              donors={donation.donors || []}
              onFormChange={(donors) => {
                if (editForm) setEditForm({ ...editForm, donors });
              }}
            />
          </TabPanel>
          <TabPanel>
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

              <FormControl isRequired={donation.imageUrls.length === 0}>
                <FormLabel>Images</FormLabel>
                <Input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleEditFileChange}
                />
              </FormControl>

              <FormImagePreview
                imageUrls={donation.imageUrls}
                onFileChange={handleEditFileChange}
              />
              <FormImageFilePreview
                files={editSelectedFiles}
                onFileChange={handleEditFileChange}
              />
            </FormControl>
            <OrganizerFormSection
              organizer={donation.organizer}
              onFormChange={handleEditFormChange}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ManagerForm>
  );
};

export default DonationDetailPage;

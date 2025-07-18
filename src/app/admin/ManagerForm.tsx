'use client';

import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  Box,
  Heading,
} from '@chakra-ui/react';
import Image from 'next/image';
import type { ChangeEvent, ReactNode, FormEvent } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BOX_SHADOW = '0 2px 8px rgba(0,0,0,0.1)';

interface ManagerFormProps<T> {
  formState: Omit<T, 'id'> | null;
  onFormChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedFiles: File[];
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  isEdit?: boolean;
  children?: ReactNode; // Untuk field spesifik
  title: string;
}

export default function ManagerForm<
  T extends { title: string; summary: string; imageUrls: string[] },
>({
  formState,
  onFormChange,
  onFileChange,
  selectedFiles,
  onSubmit,
  onCancel,
  isEdit = false,
  children,
  title,
}: ManagerFormProps<T>) {
  if (!formState) return null;

  return (
    <Box
      p={4}
      mb={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor="gray.200"
      bg="gray.50"
    >
      <form onSubmit={onSubmit}>
        <Heading size="sm" mb={4}>
          {title}
        </Heading>
        <VStack align="stretch" spacing={3}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={formState.title}
              onChange={onFormChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Summary</FormLabel>
            return{' '}
            <ReactQuill
              theme="snow"
              value={formState.summary}
              onChange={(value) => {
                const event = {
                  target: {
                    name: 'summary',
                    value,
                  },
                } as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
                onFormChange(event);
              }}
            />
            ;
          </FormControl>

          {/* Slot untuk field-field tambahan yang spesifik */}
          {children}

          <FormControl isRequired={!isEdit || formState.imageUrls.length === 0}>
            <FormLabel>Images</FormLabel>
            <Input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={onFileChange}
            />
            {/* Pratinjau untuk gambar yang sudah ada (mode edit) */}
            {isEdit && formState.imageUrls.length > 0 && (
              <HStack mt={2} spacing={2} wrap="wrap">
                {formState.imageUrls.map((url, index) => (
                  <Box key={url} position="relative">
                    <Image
                      src={url}
                      alt={`image-${index}`}
                      width={100}
                      height={100}
                      style={{
                        borderRadius: 8,
                        boxShadow: BOX_SHADOW,
                        objectFit: 'cover',
                      }}
                    />
                    <Button
                      size="xs"
                      colorScheme="red"
                      position="absolute"
                      top={0}
                      right={0}
                      onClick={() => {
                        const updatedImageUrls = formState.imageUrls.filter(
                          (_, i) => i !== index
                        );
                        onFormChange({
                          target: {
                            name: 'imageUrls',
                            value: updatedImageUrls,
                          },
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </HStack>
            )}
            {/* Pratinjau untuk gambar yang baru dipilih */}
            {selectedFiles.length > 0 && (
              <HStack mt={2} spacing={2} wrap="wrap">
                {selectedFiles.map((file, index) => (
                  <Box key={file.name} position="relative">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`new-image-${index}`}
                      width={100}
                      height={100}
                      style={{
                        borderRadius: 8,
                        boxShadow: BOX_SHADOW,
                        objectFit: 'cover',
                      }}
                    />
                    <Button
                      size="xs"
                      colorScheme="red"
                      position="absolute"
                      top={0}
                      right={0}
                      onClick={() => {
                        const updatedFiles = selectedFiles.filter(
                          (_, i) => i !== index
                        );
                        onFileChange({ target: { files: updatedFiles } });
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </HStack>
            )}
          </FormControl>

          <HStack spacing={2} mt={4}>
            <Button colorScheme={isEdit ? 'blue' : 'green'} type="submit">
              {isEdit ? 'Save Changes' : 'Add Item'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}

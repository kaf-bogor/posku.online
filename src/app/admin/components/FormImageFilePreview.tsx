import { HStack, Box, Button } from '@chakra-ui/react';
import Image from 'next/image';
import type React from 'react';

export default function FormImagePreview({
  files,
  onFileChange,
}: {
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      {files.length > 0 && (
        <HStack mt={2} spacing={2} wrap="wrap">
          {files.map((fileItem, index) => (
            <Box key={fileItem.name} position="relative">
              <Image
                src={URL.createObjectURL(fileItem)}
                alt={`new-image-${index}`}
                width={100}
                height={100}
                style={{
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                  const updatedFiles = files.filter((_, i) => i !== index);
                  const dataTransfer = new DataTransfer();
                  updatedFiles.forEach((uploadedFileItem) =>
                    dataTransfer.items.add(uploadedFileItem)
                  );
                  onFileChange({
                    target: { files: dataTransfer.files },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              >
                Remove
              </Button>
            </Box>
          ))}
        </HStack>
      )}
    </div>
  );
}

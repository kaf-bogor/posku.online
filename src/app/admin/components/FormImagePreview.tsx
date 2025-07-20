import { HStack, Box, Button } from '@chakra-ui/react';
import Image from 'next/image';
import type React from 'react';

export default function FormImagePreview({
  imageUrls,
  onFileChange,
}: {
  imageUrls: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      {imageUrls.length > 0 && (
        <HStack mt={2} spacing={2} wrap="wrap">
          {imageUrls.map((url, index) => (
            <Box key={url} position="relative">
              <Image
                src={url}
                alt={`image-${index}`}
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
                  const updatedImageUrls = imageUrls.filter(
                    (_, i) => i !== index
                  );
                  onFileChange({
                    target: {
                      name: 'imageUrls',
                      value: updatedImageUrls.join(','),
                    },
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

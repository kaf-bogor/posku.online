import { Box, Button } from '@chakra-ui/react';
import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';

export default function FormImagePreview({
  imageUrl,
  onRemoveImage,
}: {
  imageUrl: string;
  onRemoveImage: () => void;
}) {
  return (
    <Box key={imageUrl} position="relative">
      <Image
        src={imageUrl}
        alt={`image-preview-${imageUrl}`}
        width={100}
        height={100}
        style={{
          borderRadius: 8,
          boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
          objectFit: 'cover',
          height: '100px',
        }}
      />
      <Button
        size="xs"
        colorScheme="red"
        position="absolute"
        top={2}
        right={2}
        onClick={onRemoveImage}
      >
        <FaTrash />
      </Button>
    </Box>
  );
}

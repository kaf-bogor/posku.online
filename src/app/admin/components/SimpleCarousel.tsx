import { Box, Button, HStack } from '@chakra-ui/react';
import Image from 'next/image';
import { useState } from 'react';

interface SimpleCarouselProps {
  images: string[];
}

export default function SimpleCarousel({ images }: SimpleCarouselProps) {
  const [idx, setIdx] = useState(0);
  if (images.length === 0) return null;
  return (
    <Box position="relative" width="180px" height="120px">
      <Image
        src={images[idx]}
        alt={`carousel-img-${idx}`}
        width={180}
        height={120}
        style={{
          objectFit: 'cover',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      />
      {images.length > 1 && (
        <HStack position="absolute" bottom={2} left={2} spacing={1}>
          {images.map((img, i) => (
            <Button
              key={img}
              size="xs"
              variant={i === idx ? 'solid' : 'outline'}
              colorScheme="teal"
              onClick={() => setIdx(i)}
              borderRadius="full"
              minW={2}
              h={2}
              p={0}
            />
          ))}
        </HStack>
      )}
    </Box>
  );
}

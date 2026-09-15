'use client';

import {
  Box,
  HStack,
  Text,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';

const MUL = /^(\d+)\s*[×x]\s*(\d+)\s*=/;
const DIV = /^(\d+)\s*[÷/]\s*(\d+)\s*=/;

function Dot({ color }: { color: string }) {
  return (
    <WrapItem>
      <Box w="10px" h="10px" borderRadius="full" bg={color} />
    </WrapItem>
  );
}

/**
 * Visual sederhana untuk contoh matematika:
 * - "3 × 4 = 12" -> 3 baris, tiap baris 4 titik
 * - "12 ÷ 3 = 4" -> 3 kelompok, tiap kelompok 4 titik
 * Selain pola itu ditampilkan sebagai teks.
 */
export default function MathVisual({ line }: { line: string }) {
  const dot = useColorModeValue('purple.500', 'purple.300');
  const boxBg = useColorModeValue('purple.50', 'whiteAlpha.100');
  const text = line.trim();

  const mul = MUL.exec(text);
  if (mul) {
    const a = Number(mul[1]);
    const b = Number(mul[2]);
    if (a > 0 && b > 0 && a <= 10 && b <= 12) {
      return (
        <Box bg={boxBg} borderRadius="lg" p={2}>
          {Array.from({ length: a }, (_a, r) => (
            <Wrap key={`row-${r}-${a}-${b}`} spacing={1} mb={1}>
              {Array.from({ length: b }, (_b, c) => (
                <Dot key={`dot-${r}-${c}`} color={dot} />
              ))}
            </Wrap>
          ))}
          <Text fontSize="xs" color="gray.500" mt={1}>
            {a} baris × {b} titik = {a * b}
          </Text>
        </Box>
      );
    }
  }

  const div = DIV.exec(text);
  if (div) {
    const total = Number(div[1]);
    const by = Number(div[2]);
    if (
      by > 0 &&
      total > 0 &&
      total % by === 0 &&
      by <= 10 &&
      total / by <= 12
    ) {
      const per = total / by;
      return (
        <HStack spacing={2} align="start" flexWrap="wrap">
          {Array.from({ length: by }, (_a, g) => (
            <Box
              key={`grp-${g}-${by}-${per}`}
              bg={boxBg}
              borderRadius="lg"
              p={2}
              border="1px dashed"
              borderColor={dot}
            >
              <Wrap spacing={1}>
                {Array.from({ length: per }, (_b, c) => (
                  <Dot key={`gdot-${g}-${c}`} color={dot} />
                ))}
              </Wrap>
            </Box>
          ))}
        </HStack>
      );
    }
  }

  return (
    <Text fontSize="sm" fontWeight="medium">
      {line}
    </Text>
  );
}

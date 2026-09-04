'use client';

import { Link, Text, useColorModeValue } from '@chakra-ui/react';

import { resolvePicToWa } from '~/lib/utils/picWa';

/**
 * Render string PIC jadi tautan WhatsApp bila nama cocok dengan data wali santri.
 * Nama yang tidak cocok tetap tampil sebagai teks biasa.
 */
export default function PicWhatsAppLinks({
  value,
  fontSize = 'xs',
}: {
  value: string;
  fontSize?: string;
}) {
  const linkColor = useColorModeValue('teal.600', 'teal.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const matches = resolvePicToWa(value);

  if (matches.length === 0) {
    return (
      <Text as="span" color={textColor} fontSize={fontSize}>
        {value}
      </Text>
    );
  }

  return (
    <Text as="span" color={textColor} fontSize={fontSize}>
      {matches.map((m, i) => (
        <Text
          as="span"
          key={`${m.label}-${m.waHref ?? 'plain'}`}
          display="inline"
        >
          {i > 0 && ', '}
          {m.waHref ? (
            <Link
              href={m.waHref}
              isExternal
              color={linkColor}
              fontWeight={700}
              textDecoration="underline"
            >
              {m.label}
            </Link>
          ) : (
            m.label
          )}
        </Text>
      ))}
    </Text>
  );
}

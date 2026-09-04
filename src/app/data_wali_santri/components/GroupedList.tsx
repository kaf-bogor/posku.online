'use client';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  HStack,
  Link,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

import type {
  KategoriUtama,
  DataWaliSantriRecord,
} from '~/lib/types/data_wali_santri';
import { toIntlDigits } from '~/lib/utils/phone';
import {
  childClassPairs,
  KATEGORI_META,
  KATEGORI_ORDER,
} from '~/lib/utils/waliSantriMeta';

const CHIP_FIELDS: { field: string; label: string }[] = [
  { field: 'pekerjaan_utama_ayah', label: 'Pekerjaan' },
  { field: 'nama_instansi', label: 'Instansi' },
  { field: 'bidang_pekerjaan_ayah', label: 'Bidang' },
  { field: 'peran_di_pekerjaan', label: 'Peran' },
  { field: 'keahlian_ayah', label: 'Keahlian' },
  { field: 'hobi_minat', label: 'Hobi/Minat' },
];

function clean(v: string | null | undefined): string {
  if (!v) return '';
  return v.replace(/^[-.\s]+|[-.\s]+$/g, '').trim();
}

const STATUS_COLOR: Record<string, string> = {
  'Alhamdulillah sudah gabung di POSKU': 'green',
  'Ya InsyaAllah bersedia': 'blue',
  'Bersedia jika dibutuhkan': 'teal',
  'Belum bisa saat ini': 'gray',
};

const STATUS_COLOR_TAWAF: Record<string, string> = {
  'Alhamdulillah sudah gabung di Tawaf/Bilistiwa': 'green',
  'Ya InsyaAllah bersedia': 'blue',
  'Bersedia jika dibutuhkan': 'teal',
  'Belum bisa saat ini': 'gray',
};

const KontribusiItem = ({
  label,
  value,
  statusColor,
  detail,
}: {
  label: string;
  value: string;
  statusColor: string;
  detail: string;
}) => {
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  return (
    <HStack spacing={2} wrap="wrap" fontSize="sm">
      <Text color={mutedColor} minW="150px">
        {label}:
      </Text>
      <Badge colorScheme={statusColor} px={2}>
        {value}
      </Badge>
      {detail && (
        <Text fontSize="xs" color={mutedColor}>
          {detail}
        </Text>
      )}
    </HStack>
  );
};

const PersonCard = ({ record }: { record: DataWaliSantriRecord }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const ayahName = clean(record.nama_ayah);
  const ibuName = clean(record.nama_ibu);
  const alamat = clean(record.alamat_rumah);
  const lokasi = clean(record.lokasi);

  const phoneAyah = toIntlDigits(record.no_hp_ayah);
  const phoneIbu = toIntlDigits(record.no_hp_ibu);

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      shadow="sm"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="flex-start" wrap="wrap" gap={2}>
          <Box>
            <Text fontWeight="bold" fontSize="md">
              {ayahName || 'Data ayah belum diisi'}
              {ibuName && (
                <Text as="span" fontWeight="normal" color={mutedColor}>
                  {' '}
                  &amp; {ibuName}
                </Text>
              )}
            </Text>
            {(clean(record.nama_anak) || clean(record.kelas_anak)) && (
              <VStack align="start" spacing={0} mt={1}>
                {childClassPairs(record).map(({ name, kelas }) => (
                  <Text
                    key={`${name}-${kelas}-${record.id}`}
                    fontSize="sm"
                    color={mutedColor}
                  >
                    {name ? `${name} — ` : ''}
                    {kelas ? <Text as="b">{kelas}</Text> : null}
                  </Text>
                ))}
              </VStack>
            )}
          </Box>
          <HStack spacing={2}>
            {phoneAyah && (
              <Link
                href={`https://wa.me/${phoneAyah}`}
                isExternal
                aria-label="WhatsApp Ayah"
              >
                <Badge colorScheme="green" px={2} py={1} cursor="pointer">
                  <HStack spacing={1}>
                    <FaWhatsapp />
                    <Text fontSize="xs">WA</Text>
                  </HStack>
                </Badge>
              </Link>
            )}
            {phoneIbu && (
              <Link
                href={`https://wa.me/${phoneIbu}`}
                isExternal
                aria-label="WhatsApp Ibu"
              >
                <Badge colorScheme="green" px={2} py={1} cursor="pointer">
                  <HStack spacing={1}>
                    <FaWhatsapp />
                    <Text fontSize="xs">WA</Text>
                  </HStack>
                </Badge>
              </Link>
            )}
          </HStack>
        </HStack>

        <Box>
          <HStack spacing={3} wrap="wrap" fontSize="sm">
            {phoneAyah && (
              <Link href={`tel:+${phoneAyah}`} color="blue.400">
                <HStack spacing={1}>
                  <FaPhoneAlt size={11} />
                  <Text>Ayah: {record.no_hp_ayah}</Text>
                </HStack>
              </Link>
            )}
            {phoneIbu && (
              <Link href={`tel:+${phoneIbu}`} color="blue.400">
                <HStack spacing={1}>
                  <FaPhoneAlt size={11} />
                  <Text>Ibu: {record.no_hp_ibu}</Text>
                </HStack>
              </Link>
            )}
          </HStack>
        </Box>

        <Divider />

        <VStack align="stretch" spacing={1}>
          {CHIP_FIELDS.map(({ field, label }) => {
            const value = clean(
              record[field as keyof DataWaliSantriRecord] as string
            );
            if (!value) return null;
            return (
              <HStack key={field} spacing={2} align="start" fontSize="sm">
                <Text color={mutedColor} minW="84px">
                  {label}:
                </Text>
                <Text>{value}</Text>
              </HStack>
            );
          })}
        </VStack>

        <Divider />

        <VStack align="stretch" spacing={2}>
          {clean(record.ayah_bersedia_posku) && (
            <KontribusiItem
              label="Kontribusi Ayah (POSKU)"
              value={clean(record.ayah_bersedia_posku)}
              statusColor={
                STATUS_COLOR[clean(record.ayah_bersedia_posku)] ?? 'gray'
              }
              detail={clean(record.bidang_diminati_ayah)}
            />
          )}
          {clean(record.ibu_bersedia_posku) && (
            <KontribusiItem
              label="Kontribusi Ibu (POSKU)"
              value={clean(record.ibu_bersedia_posku)}
              statusColor={
                STATUS_COLOR[clean(record.ibu_bersedia_posku)] ?? 'gray'
              }
              detail={clean(record.bidang_diminati_ibu)}
            />
          )}
          {clean(record.ayah_bersedia_tawaf) && (
            <KontribusiItem
              label="Kontribusi Ayah (TAWAF)"
              value={clean(record.ayah_bersedia_tawaf)}
              statusColor={
                STATUS_COLOR_TAWAF[clean(record.ayah_bersedia_tawaf)] ?? 'gray'
              }
              detail={clean(record.kontribusi_tawaf)}
            />
          )}
        </VStack>

        {alamat && (
          <Text fontSize="sm" color={mutedColor}>
            {alamat}
            {lokasi && <Text as="span"> ({lokasi})</Text>}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

type Grouping = {
  kategori: KategoriUtama;
  subkategori: string | null;
  items: DataWaliSantriRecord[];
};

const GroupedList = ({ records }: { records: DataWaliSantriRecord[] }) => {
  const emptyBg = useColorModeValue('gray.50', 'gray.700');
  const subColor = useColorModeValue('gray.500', 'gray.400');
  const { colorMode } = useColorMode();

  const groupHeaderBg = (scheme: string) =>
    colorMode === 'dark' ? `${scheme}.900` : `${scheme}.50`;
  const groupHeaderBgExpanded = (scheme: string) =>
    colorMode === 'dark' ? `${scheme}.800` : `${scheme}.100`;

  const groups = useMemo(() => {
    // When major selected, keep only that major unless all.
    const map = new Map<string, Grouping>();
    records.forEach((r) => {
      const key = `${r.kategori}::${r.subkategori ?? ''}`;
      if (!map.has(key)) {
        map.set(key, {
          kategori: r.kategori,
          subkategori: r.subkategori,
          items: [],
        });
      }
      map.get(key)!.items.push(r);
    });
    const arr = Array.from(map.values());
    // order: by kategori order, profesional ordered by subgroup count desc
    arr.sort((a, b) => {
      const ia = KATEGORI_ORDER.indexOf(a.kategori);
      const ib = KATEGORI_ORDER.indexOf(b.kategori);
      if (ia !== ib) return ia - ib;
      if (a.subkategori && b.subkategori)
        return a.subkategori.localeCompare(b.subkategori);
      return 0;
    });
    return arr;
  }, [records]);

  if (records.length === 0) {
    return (
      <Box bg={emptyBg} borderRadius="xl" p={10} textAlign="center">
        <Text color={subColor}>Tidak ada data yang cocok dengan filter.</Text>
      </Box>
    );
  }

  return (
    <Accordion defaultIndex={[0]} allowMultiple>
      {groups.map((group, idx) => {
        const colorScheme = KATEGORI_META[group.kategori].color;
        return (
          <AccordionItem
            key={`${group.kategori}-${group.subkategori ?? idx}`}
            borderWidth="1px"
            mb={3}
          >
            <h2>
              <AccordionButton
                py={3}
                bg={groupHeaderBg(colorScheme)}
                borderRadius="xl"
                _expanded={{ bg: groupHeaderBgExpanded(colorScheme) }}
              >
                <Box flex="1" textAlign="left">
                  <HStack spacing={2}>
                    <Badge colorScheme={colorScheme} px={2} py={0.5}>
                      {KATEGORI_META[group.kategori].label}
                    </Badge>
                    {group.subkategori && (
                      <Text fontWeight="bold" fontSize="md">
                        {group.subkategori}
                      </Text>
                    )}
                    <Text color={subColor} fontSize="sm">
                      ({group.items.length})
                    </Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} pt={3}>
              {group.items.length === 0 ? (
                <Text color={subColor}>Belum ada data</Text>
              ) : (
                <VStack spacing={3} align="stretch">
                  {group.items.map((r) => (
                    <PersonCard key={r.id} record={r} />
                  ))}
                </VStack>
              )}
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default GroupedList;

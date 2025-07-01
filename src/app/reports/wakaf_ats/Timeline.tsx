import { Box, Flex, Text } from '@chakra-ui/react';

export type TimelineEvent = {
  date: Date;
  title: string;
  desc?: string;
};

// Timeline data array
const timelineDataRaw = [
  {
    date: '2025-06-21',
    title: 'Peresmian Wakaf Lahan ATS di Kajian Orang tua',
    desc: 'Total Kebutuhan Rp 2,8 Miliar untuk pembelian tanah, Rp 2 Milyar untuk DP. sisanya dicicil 1 tahun. ditambah kebutuhan Rp. 300 juta untuk renovasi',
  },
  {
    date: '2025-06-24',
    title: 'Laporan kondisi keuangan wakaf',
    desc: 'Total uang muka (DP) sebesar Rp2 miliar, dengan Rp400 juta telah dibayarkan sebagai uang muka awal. Saat ini tersedia Rp1,4 miliar di rekening wakaf, sehingga masih terdapat kekurangan sebesar Rp200 juta untuk melunasi DP tersebut. Pak Fadil telah meminta agar pelunasan dilakukan pada hari Senin, agar akad jual beli dan wakaf dapat segera ditandatangani serta proses AIW bisa segera dimulai.',
  },
  {
    date: '2025-06-27',
    title: 'Tambahan dana Rp. 200 Juta',
    desc: 'Wakaf dari hamba Allah.',
  },
  {
    date: '2025-06-27',
    title: 'Tambahan dana Rp. 3,2 Juta.',
    desc: 'Wakaf dari komunitas mini soccer.',
  },
  {
    date: '2025-06-30',
    title: 'Pelunasan DP',
    desc: '',
  },
];

export default function Timeline() {
  const events: TimelineEvent[] = timelineDataRaw
    .map((event) => ({ ...event, date: new Date(event.date) }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Box className="card" bg="white" rounded="xl" shadow="md" p={6} w="full">
      <Text
        as="h2"
        fontSize="3xl"
        fontWeight="bold"
        color="gray.800"
        mb={6}
        textAlign="center"
      >
        Linimasa & Pembaruan Terakhir
      </Text>
      <Box position="relative" pl={8}>
        <Box position="absolute" w="1" h="full" bg="gray.300" rounded="full" />
        {events.map((event) => (
          <Box
            mb={8}
            position="relative"
            key={event.date.toISOString() + (event.title || '')}
          >
            <Flex alignItems="center">
              <Box
                position="absolute"
                ml="-2"
                w="4"
                h="4"
                bg={event.date > new Date() ? 'orange.600' : 'blue.500'}
                rounded="full"
                zIndex="1"
              />
              <Text
                ml={{ base: 6, sm: 12 }}
                fontSize="lg"
                fontWeight="semibold"
                color="gray.800"
              >
                {event.date.toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
                {event.date > new Date() ? ' (Akan datang)' : ''}
              </Text>
            </Flex>
            <Box
              ml={{ base: 6, sm: 12 }}
              color="gray.700"
              mt={2}
              p={3}
              bg="blue.50"
              borderLeft="4px"
              borderColor={event.date > new Date() ? 'orange.600' : 'blue.500'}
              rounded="lg"
              shadow="sm"
            >
              {event.title && (
                <Text>
                  <Text as="span" fontWeight="bold">
                    {event.title}
                  </Text>
                </Text>
              )}
              {event.desc && <Text>{event.desc}</Text>}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

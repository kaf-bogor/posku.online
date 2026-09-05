'use client';

import {
  Box,
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  List,
  ListItem,
  Progress,
  Spinner,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import {
  addWakafParticipant,
  getWakafKelas,
  removeWakafParticipant,
  updateWakafKelasTarget,
} from '~/lib/services/kelasService';
import type {
  WakafActivity,
  WakafKelas as Kelas,
} from '~/lib/services/kelasService';
import { formatIDR } from '~/lib/utils/currency';

export default function KelasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { bgColor, textColor, borderColor } = useContext(AppContext);

  const kelasName = decodeURIComponent(id);

  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [participantValue, setParticipantValue] = useState('');
  const [participantDate, setParticipantDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [saving, setSaving] = useState(false);
  const [newTarget, setNewTarget] = useState('');

  useEffect(() => {
    if (kelas?.target !== undefined) {
      setNewTarget(kelas.target.toString());
    }
  }, [kelas?.target]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getWakafKelas(kelasName);
        if (active) setKelas(data);
      } catch {
        if (active) setLoading(false);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [kelasName]);

  const refresh = async () => {
    const data = await getWakafKelas(kelasName);
    setKelas(data);
  };

  const addParticipant = async () => {
    if (!participantName || !participantValue || !participantDate) return;
    setSaving(true);
    try {
      await addWakafParticipant(kelasName, {
        name: participantName,
        value: Number(participantValue),
        datetime: new Date(participantDate).toISOString(),
      });
      setParticipantName('');
      setParticipantValue('');
      setParticipantDate(new Date().toISOString().substring(0, 10));
      refresh();
    } catch (err) {
      toast({
        title: 'Gagal menambah peserta',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  const removeParticipant = async (participant: {
    name: string;
    value: number;
    datetime: string;
  }) => {
    if (!participant) return;
    setSaving(true);
    try {
      await removeWakafParticipant(kelasName, participant);
      refresh();
    } catch {
      // UI akan merefresh dari snapshot terbaru
    } finally {
      setSaving(false);
    }
  };

  const updateTarget = async () => {
    if (!newTarget) return;
    setSaving(true);
    try {
      await updateWakafKelasTarget(kelasName, Number(newTarget));
      refresh();
    } catch (err) {
      toast({
        title: 'Gagal menyimpan target',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !kelas) {
    return (
      <Box p={8} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  const derivedCollected = (kelas.participants ?? []).reduce(
    (total, p) => total + (p?.value ?? 0),
    0
  );
  const percent =
    kelas.target && kelas.target > 0
      ? Math.min((derivedCollected / kelas.target) * 100, 100)
      : 0;

  return (
    <VStack
      align="stretch"
      spacing={6}
      p={6}
      maxW="600px"
      mx="auto"
      color={textColor}
      bg={bgColor}
    >
      <HStack spacing={4} justify="space-between">
        <Heading size="lg">{kelas.name}</Heading>
        <Button variant="link" onClick={() => router.back()}>
          Kembali
        </Button>
      </HStack>

      <Text>
        Perolehan: {formatIDR(derivedCollected)} / {formatIDR(kelas.target)}
      </Text>
      <Flex align="center" mb={2}>
        <Progress
          value={percent}
          size="sm"
          flex="1"
          borderRadius="sm"
          colorScheme="blue"
          mr={2}
        />
        <Text fontSize="sm" color="blue.600" minW="45px" textAlign="right">
          {percent.toFixed(2)}%
        </Text>
      </Flex>
      <Text>Jumlah Santri: {kelas.santriCount}</Text>
      <Text>Total Peserta Saat Ini: {kelas.participants?.length ?? 0}</Text>

      <Box>
        <Heading size="md" mb={2}>
          Edit Target
        </Heading>
        <HStack>
          <Input
            type="number"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
          />
          <Button colorScheme="green" onClick={updateTarget} isLoading={saving}>
            Simpan
          </Button>
        </HStack>
      </Box>

      <Box>
        <Heading size="md" mb={2}>
          Tambah Peserta
        </Heading>
        <VStack align="stretch" spacing={3}>
          <FormControl isRequired>
            <FormLabel>Nama</FormLabel>
            <Input
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Tanggal</FormLabel>
            <Input
              type="date"
              value={participantDate}
              onChange={(e) => setParticipantDate(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Nominal (Rp)</FormLabel>
            <Input
              type="number"
              value={participantValue}
              onChange={(e) => setParticipantValue(e.target.value)}
            />
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={addParticipant}
            isLoading={saving}
          >
            Simpan
          </Button>
        </VStack>
      </Box>

      <Box>
        <Heading size="md" mb={2}>
          Daftar Peserta
        </Heading>
        {kelas.participants && kelas.participants.length > 0 ? (
          <List spacing={2}>
            {kelas.participants.map((p) => (
              <ListItem
                key={`${p.name}-${p.datetime}`}
                borderBottom="1px"
                borderColor={borderColor}
                pb={2}
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text>{p.name}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(p.datetime).toLocaleString('id-ID')}
                    </Text>
                  </VStack>
                  <HStack spacing={4}>
                    <Text fontWeight="bold">
                      Rp {p.value.toLocaleString('id-ID')}
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeParticipant(p)}
                      isLoading={saving}
                    >
                      <FaTrash />
                    </Button>
                  </HStack>
                </HStack>
              </ListItem>
            ))}
          </List>
        ) : (
          <Text>Tidak ada peserta.</Text>
        )}
      </Box>

      {/* Activities Panel */}
      <Box>
        <Heading size="md" mb={2} mt={4}>
          Aktivitas
        </Heading>
        {kelas.activities && kelas.activities.length > 0 ? (
          <List spacing={3} maxH="300px" overflowY="auto">
            {kelas.activities
              .slice()
              .sort(
                (a: WakafActivity, b: WakafActivity) =>
                  new Date(b.datetime).getTime() -
                  new Date(a.datetime).getTime()
              )
              .map((act) => (
                <ListItem
                  key={act.datetime + act.type + act.description}
                  borderBottomWidth="1px"
                  pb={2}
                >
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold">
                      {act.userName ?? 'Unknown'}{' '}
                      <Badge colorScheme="purple">{act.type}</Badge>
                    </Text>
                    <Text fontSize="sm">{act.description}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(act.datetime).toLocaleString('id-ID')}
                    </Text>
                  </VStack>
                </ListItem>
              ))}
          </List>
        ) : (
          <Text>Tidak ada aktivitas.</Text>
        )}
      </Box>
    </VStack>
  );
}

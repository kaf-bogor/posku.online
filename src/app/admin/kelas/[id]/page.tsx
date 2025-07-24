'use client';

import {
  Box,
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
} from '@chakra-ui/react';
import {
  arrayUnion,
  arrayRemove,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  increment,
} from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';

import { AppContext } from '~/lib/context/app';
import { db } from '~/lib/firebase';
import { formatIDR } from '~/lib/utils/currency';

interface Participant {
  name: string;
  value: number;
  datetime: string;
}

interface Kelas {
  name: string;
  santriCount: number;
  target?: number;
  participants?: Participant[];
  collected?: number;
}

export default function KelasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { bgColor, textColor } = useContext(AppContext);

  const kelasName = decodeURIComponent(id);

  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [participantValue, setParticipantValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ref = doc(db, 'kelas', kelasName);

    // Ensure doc exists
    (async () => {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          name: kelasName,
          santriCount: 0,
          target: 0,
          participants: [],
          collected: 0,
        } as Kelas);
      }
    })();

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setKelas(snap.data() as Kelas);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [kelasName]);

  const addParticipant = async () => {
    if (!participantName || !participantValue) return;
    setSaving(true);
    const ref = doc(db, 'kelas', kelasName);
    const valueNum = Number(participantValue);
    await updateDoc(ref, {
      participants: arrayUnion({
        name: participantName,
        value: valueNum,
        datetime: new Date().toISOString(),
      } as Participant),
      collected: increment(valueNum),
    });
    setParticipantName('');
    setParticipantValue('');
    setSaving(false);
  };

  const removeParticipant = async (participant: Participant) => {
    if (!participant) return;
    setSaving(true);
    const ref = doc(db, 'kelas', kelasName);
    await updateDoc(ref, {
      participants: arrayRemove(participant),
      collected: increment(-participant.value),
    });
    setSaving(false);
  };

  if (loading || !kelas) {
    return (
      <Box p={8} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  const percent = ((kelas?.collected || 0) / (kelas?.target || 0)) * 100;

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
        Perolehan: {formatIDR(kelas.collected)} / {formatIDR(kelas.target)}
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
                key={p.name}
                borderBottom="1px"
                borderColor="gray.100"
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
    </VStack>
  );
}

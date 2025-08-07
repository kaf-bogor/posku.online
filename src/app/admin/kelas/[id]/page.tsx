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
} from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
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

const getUserInfo = () => {
  const u = getAuth().currentUser;
  return {
    userId: u?.uid ?? 'anonymous',
    userName: u?.displayName ?? u?.email ?? 'Anonymous',
  };
};

interface Participant {
  name: string;
  value: number;
  datetime: string;
}

interface Activity {
  userId: string;
  userName: string | null;
  type: 'add' | 'remove' | 'update_target';
  description: string;
  datetime: string;
}

interface Kelas {
  name: string;
  santriCount: number;
  target?: number;
  activities?: Activity[];
  participants?: Participant[];
  collected?: number;
}

export default function KelasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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

  // Sync editable target when kelas data arrives
  useEffect(() => {
    if (kelas?.target !== undefined) {
      setNewTarget(kelas.target.toString());
    }
  }, [kelas?.target]);

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
          activities: [],
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
    if (!participantName || !participantValue || !participantDate) return;
    setSaving(true);
    const ref = doc(db, 'kelas', kelasName);
    const valueNum = Number(participantValue);
    const { userId, userName } = getUserInfo();

    const newActivity: Activity = {
      userId,
      userName,
      type: 'add',
      description: `Menambah peserta ${participantName} dengan nominal Rp ${valueNum.toLocaleString('id-ID')}`,
      datetime: new Date().toISOString(),
    };
    await updateDoc(ref, {
      participants: arrayUnion({
        name: participantName,
        value: valueNum,
        datetime: new Date(participantDate).toISOString(),
      } as Participant),
      collected: increment(valueNum),
      activities: arrayUnion(newActivity),
    });
    setParticipantName('');
    setParticipantValue('');
    setParticipantDate(new Date().toISOString().substring(0, 10));
    setSaving(false);
  };

  const removeParticipant = async (participant: Participant) => {
    if (!participant) return;
    setSaving(true);
    const ref = doc(db, 'kelas', kelasName);
    const { userId: delUid, userName: delName } = getUserInfo();
    const delActivity: Activity = {
      userId: delUid,
      userName: delName,
      type: 'remove',
      description: `Menghapus peserta ${participant.name} dengan nominal Rp ${participant.value.toLocaleString('id-ID')}`,
      datetime: new Date(participantDate).toISOString(),
    };
    await updateDoc(ref, {
      participants: arrayRemove(participant),
      collected: increment(-participant.value),
      activities: arrayUnion(delActivity),
    });
    setSaving(false);
  };

  const updateTarget = async () => {
    if (!newTarget) return;
    setSaving(true);
    const ref = doc(db, 'kelas', kelasName);
    const { userId: updUid, userName: updName } = getUserInfo();
    const updActivity: Activity = {
      userId: updUid,
      userName: updName,
      type: 'update_target',
      description: `Mengubah target dari Rp ${(kelas?.target ?? 0).toLocaleString('id-ID')} ke Rp ${Number(newTarget).toLocaleString('id-ID')}`,
      datetime: new Date(participantDate).toISOString(),
    };
    await updateDoc(ref, {
      target: Number(newTarget),
      activities: arrayUnion(updActivity),
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
              .slice() // copy
              .sort(
                (a, b) =>
                  new Date(b.datetime).getTime() -
                  new Date(a.datetime).getTime()
              )
              .map((act) => (
                <ListItem key={act.datetime} borderBottomWidth="1px" pb={2}>
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

'use client';

import {
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { useContext, useEffect, useMemo, useState } from 'react';

import DataChatBox from '~/app/components/DataChatBox';
import { AppContext } from '~/lib/context/app';
import rawData from '~/lib/data/tahun_ajaran_2026_2027.json';
import { useTahunAjaran } from '~/lib/hooks/useTahunAjaran';

interface Teacher {
  role: string;
  name: string;
  phone?: string;
}

interface Sibling {
  name: string;
  class: string;
  academic_year?: string | null;
}

interface Student {
  name: string;
  ayah: string | null;
  bunda: string | null;
  kode_registrasi: string | null;
  academic_year: string | null;
  siblings: Sibling[] | null;
}

interface ClassInfo {
  name: string;
  teachers: Teacher[];
  students: Student[];
}

const CLASS_BG_LIGHT: [string, string][] = [
  ['kuttab awal 1', '#eff6ff'],
  ['kuttab awal 2', '#f0fdf4'],
  ['kuttab awal 3', '#fefce8'],
  ['qonuni 1', '#faf5ff'],
  ['qonuni 2', '#fdf2f8'],
  ['qonuni 3', '#eef2ff'],
  ['qonuni 4', '#fff1f2'],
];

const CLASS_BG_DARK: [string, string][] = [
  ['kuttab awal 1', '#1a2535'],
  ['kuttab awal 2', '#162520'],
  ['kuttab awal 3', '#252310'],
  ['qonuni 1', '#1e1530'],
  ['qonuni 2', '#251525'],
  ['qonuni 3', '#151825'],
  ['qonuni 4', '#251518'],
];

function getClassBg(name: string, isDark: boolean): string {
  const lower = name.toLowerCase();
  const map = isDark ? CLASS_BG_DARK : CLASS_BG_LIGHT;
  const found = map.find(([key]) => lower.includes(key));
  if (found) return found[1];
  return isDark ? '#1a202c' : '#ffffff';
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, term: string): string {
  if (!term) return text;
  const re = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return text.replace(
    re,
    '<mark style="background:#fcd34d;border-radius:3px;padding:0 2px">$1</mark>'
  );
}

export default function DataSantriTA20262027Page() {
  const { bgColor, borderColor } = useContext(AppContext);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const cardShadow = useColorModeValue('md', 'dark-lg');
  const headingColor = useColorModeValue('gray.900', 'white');
  const subHeadingColor = useColorModeValue('gray.700', 'gray.300');
  const teacherBg = useColorModeValue('#f9fafb', '#2d3748');
  const studentListBg = useColorModeValue('#fefefe', '#1a202c');
  const classNameColor = useColorModeValue('blue.700', 'blue.300');
  const teacherTextColor = useColorModeValue('gray.800', 'gray.100');
  const sectionHeadingColor = useColorModeValue('gray.800', 'gray.100');
  const matchedStudentColor = useColorModeValue('gray.900', 'gray.100');
  const studentHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const siblingBg = useColorModeValue('blue.50', 'blue.900');
  const siblingColor = useColorModeValue('blue.700', 'blue.200');
  const modalBg = useColorModeValue('white', 'gray.800');
  const modalLabelColor = useColorModeValue('gray.500', 'gray.400');

  const lockBtnBg = useColorModeValue('gray.100', 'gray.700');
  const lockBtnColor = useColorModeValue('gray.700', 'gray.200');

  const { data: classes } = useTahunAjaran<ClassInfo[]>({
    tahun: '2026/2027',
    fallback: rawData as ClassInfo[],
  });
  const [search, setSearch] = useState('');
  const [openIdxs, setOpenIdxs] = useState<number[]>([]);
  const [selected, setSelected] = useState<{
    student: Student;
    className: string;
  } | null>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('ds_unlocked') === '1') setIsUnlocked(true);
  }, []);

  function handleUnlock() {
    if (pwInput === 'qonun1') {
      sessionStorage.setItem('ds_unlocked', '1');
      setIsUnlocked(true);
      setShowLockModal(false);
      setPwInput('');
      setPwError('');
    } else {
      setPwError('Password salah.');
    }
  }

  function handleLock() {
    sessionStorage.removeItem('ds_unlocked');
    setIsUnlocked(false);
    setSelected(null);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function handleCloseLockModal() {
    setShowLockModal(false);
    setPwInput('');
    setPwError('');
  }

  function toggleCard(idx: number) {
    setOpenIdxs((prev) => {
      if (prev.includes(idx)) return [];
      return [idx];
    });
  }

  function handleLockToggle() {
    if (isUnlocked) {
      handleLock();
    } else {
      setShowLockModal(true);
    }
  }

  function handleCardToggle(e: React.MouseEvent<HTMLElement>) {
    toggleCard(Number((e.currentTarget as HTMLElement).dataset.idx));
  }

  function handleStudentClick(e: React.MouseEvent<HTMLElement>) {
    if (!isUnlocked) return;
    const el = e.currentTarget as HTMLElement;
    const studentName = el.dataset.studentName ?? '';
    const cls = el.dataset.className ?? '';
    const classData = classes.find((c) => c.name === cls);
    const student = classData?.students.find((s) => s.name === studentName);
    if (student) setSelected({ student, className: cls });
  }

  function handlePwInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPwInput(e.target.value);
    setPwError('');
  }

  function handlePwKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleUnlock();
  }

  function handleTogglePw() {
    setShowPw((v) => !v);
  }

  function handleCloseDetailModal() {
    setSelected(null);
  }

  const filtered = useMemo(() => {
    if (!search) return classes;
    const lower = search.toLowerCase();
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.teachers.some(
          (t) =>
            t.name.toLowerCase().includes(lower) ||
            t.role.toLowerCase().includes(lower)
        ) ||
        c.students.some(
          (s) =>
            s.name.toLowerCase().includes(lower) ||
            (s.ayah ?? '').toLowerCase().includes(lower) ||
            (s.bunda ?? '').toLowerCase().includes(lower)
        )
    );
  }, [classes, search]);

  useEffect(() => {
    if (search) {
      setOpenIdxs(filtered.map((_, i) => i));
    } else {
      setOpenIdxs([]);
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalSantri = useMemo(
    () => classes.reduce((sum, c) => sum + c.students.length, 0),
    [classes]
  );

  const totalMatched = useMemo(() => {
    if (!search) return 0;
    const lower = search.toLowerCase();
    return classes.reduce(
      (sum, c) =>
        sum +
        c.students.filter((s) => s.name.toLowerCase().includes(lower)).length,
      0
    );
  }, [classes, search]);

  const allOpen = filtered.length > 0 && openIdxs.length >= filtered.length;

  function toggleAll() {
    if (allOpen) {
      setOpenIdxs([]);
    } else {
      setOpenIdxs(filtered.map((_, i) => i));
    }
  }

  return (
    <>
      <Box
        maxW="4xl"
        mx="auto"
        px={{ base: 2, sm: 4, lg: 6 }}
        py={{ base: 4, sm: 6, lg: 8 }}
        mb={10}
      >
        <Box
          bg={bgColor}
          p={{ base: 4, sm: 6, lg: 8 }}
          borderRadius="xl"
          boxShadow={cardShadow}
        >
          {/* Header */}
          <HStack
            justify="space-between"
            align="flex-start"
            mb={4}
            flexWrap="wrap"
            gap={3}
          >
            <VStack align="flex-start" spacing={0}>
              <Heading size="xl" fontWeight="extrabold" color={headingColor}>
                Pembagian Kelas dan Pengajar
              </Heading>
              <Heading size="lg" fontWeight="semibold" color={subHeadingColor}>
                Kuttab Al-Fatih Bogor
              </Heading>
              <Text fontSize="lg" color="gray.500">
                TA. 2026-2027, Total Santri:{' '}
                <Text as="span" fontWeight="bold">
                  {totalSantri}
                </Text>
              </Text>
            </VStack>
            <HStack spacing={2} flexShrink={0}>
              <Box
                as="button"
                type="button"
                px={3}
                py={2}
                bg={lockBtnBg}
                color={lockBtnColor}
                borderRadius="lg"
                fontWeight="medium"
                fontSize="sm"
                border="1px solid"
                borderColor={borderColor}
                onClick={handleLockToggle}
                _hover={{ opacity: 0.8 }}
                transition="opacity 0.15s ease"
                title={isUnlocked ? 'Kunci info santri' : 'Buka info santri'}
              >
                {isUnlocked ? '🔓 Terkunci: Matikan' : '🔒 Info Santri'}
              </Box>
              <Box
                as="button"
                type="button"
                px={4}
                py={2}
                bg="blue.600"
                color="white"
                borderRadius="lg"
                fontWeight="medium"
                fontSize="sm"
                onClick={toggleAll}
                _hover={{ bg: 'blue.700' }}
                transition="background 0.15s ease"
              >
                {allOpen ? 'Tutup Semua' : 'Buka Semua'}
              </Box>
            </HStack>
          </HStack>

          {/* Search */}
          <Box mb={6}>
            <Input
              placeholder="Cari nama kelas, guru, atau santri..."
              value={search}
              onChange={handleSearch}
              size="lg"
              focusBorderColor="blue.400"
              borderColor={borderColor}
            />
            {search && (
              <Text mt={2} color="gray.600" fontSize="lg">
                {totalMatched} santri ditemukan
              </Text>
            )}
          </Box>

          {/* Grid */}
          {filtered.length === 0 ? (
            <Text textAlign="center" color="gray.500" fontSize="lg">
              Tidak ada hasil yang ditemukan.
            </Text>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={4}
            >
              {filtered.map((classInfo, idx) => {
                const isOpen = openIdxs.includes(idx);
                const cardBg = getClassBg(classInfo.name, isDark);

                return (
                  <Box
                    key={classInfo.name}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderColor}
                    boxShadow="md"
                    style={{ backgroundColor: cardBg }}
                    overflow="hidden"
                    transition="transform 0.2s ease, box-shadow 0.2s ease"
                    _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                  >
                    <Box
                      as="button"
                      type="button"
                      w="full"
                      display="flex"
                      alignItems="center"
                      p={5}
                      gap={3}
                      textAlign="left"
                      data-idx={idx}
                      onClick={handleCardToggle}
                      _hover={{ bg: 'blackAlpha.50' }}
                      transition="background 0.15s ease"
                    >
                      <HStack flex={1} spacing={3}>
                        <Box
                          as="h3"
                          fontSize={{ base: 'lg', md: 'xl' }}
                          fontWeight="bold"
                          color={classNameColor}
                          dangerouslySetInnerHTML={{
                            __html: highlight(classInfo.name, search),
                          }}
                        />
                        <Badge
                          colorScheme="blue"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="sm"
                          ml="auto"
                          flexShrink={0}
                        >
                          {classInfo.students.length} Santri
                        </Badge>
                      </HStack>
                      <Box
                        as="svg"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 10 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        w={3}
                        h={3}
                        flexShrink={0}
                        transition="transform 0.3s ease"
                        style={{
                          transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                        }}
                      >
                        <path d="M9 5 5 1 1 5" />
                      </Box>
                    </Box>

                    {isOpen && (
                      <Box
                        p={5}
                        borderTop="1px solid"
                        borderColor={borderColor}
                      >
                        <VStack spacing={2} mb={4} align="stretch">
                          {classInfo.teachers.map((teacher) => (
                            <HStack
                              key={teacher.name}
                              style={{ backgroundColor: teacherBg }}
                              borderLeft="4px solid"
                              borderColor="blue.400"
                              p={3}
                              borderRadius="md"
                              justify="space-between"
                            >
                              <Box
                                as="p"
                                fontWeight="semibold"
                                color={teacherTextColor}
                                dangerouslySetInnerHTML={{
                                  __html: highlight(
                                    `${teacher.role}: ${teacher.name}`,
                                    search
                                  ),
                                }}
                              />
                              {teacher.phone && (
                                <Link
                                  href={`https://wa.me/${teacher.phone.replace(/[\s\-+]/g, '')}`}
                                  isExternal
                                  ml="auto"
                                  flexShrink={0}
                                >
                                  <Box
                                    as="img"
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/250px-WhatsApp.svg.png"
                                    alt="WhatsApp"
                                    w={7}
                                    h={7}
                                    _hover={{ opacity: 0.8 }}
                                    transition="opacity 0.2s"
                                    onError={(
                                      e: React.SyntheticEvent<HTMLImageElement>
                                    ) => {
                                      e.currentTarget.src =
                                        'https://placehold.co/28x28/cccccc/ffffff?text=WA';
                                    }}
                                  />
                                </Link>
                              )}
                            </HStack>
                          ))}
                        </VStack>

                        <Heading size="sm" mb={3} color={sectionHeadingColor}>
                          Daftar Santri:
                        </Heading>
                        <List
                          style={{ backgroundColor: studentListBg }}
                          borderRadius="lg"
                          p={4}
                          spacing={1}
                          overflowY="auto"
                          maxH="64"
                        >
                          {classInfo.students.map((student, sIdx) => {
                            const lower = search.toLowerCase();
                            const isMatch =
                              !search ||
                              student.name.toLowerCase().includes(lower) ||
                              (student.ayah ?? '')
                                .toLowerCase()
                                .includes(lower) ||
                              (student.bunda ?? '')
                                .toLowerCase()
                                .includes(lower);
                            return (
                              <ListItem
                                key={student.name}
                                py={1}
                                px={2}
                                borderRadius="md"
                                color={
                                  isMatch ? matchedStudentColor : 'gray.500'
                                }
                                fontSize="sm"
                                _hover={{ bg: studentHoverBg }}
                              >
                                <Box
                                  cursor={isUnlocked ? 'pointer' : 'default'}
                                  _hover={
                                    isUnlocked
                                      ? { textDecoration: 'underline' }
                                      : {}
                                  }
                                  data-student-name={student.name}
                                  data-class-name={classInfo.name}
                                  onClick={handleStudentClick}
                                  title={
                                    isUnlocked
                                      ? ''
                                      : 'Aktifkan info santri untuk melihat detail'
                                  }
                                  dangerouslySetInnerHTML={{
                                    __html: highlight(
                                      `${sIdx + 1}. ${student.name}`,
                                      search
                                    ),
                                  }}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Password unlock modal */}
      <Modal
        isOpen={showLockModal}
        onClose={handleCloseLockModal}
        isCentered
        size="sm"
      >
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={headingColor}>Masukkan Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={2}>
            <FormControl isInvalid={!!pwError}>
              <InputGroup>
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password"
                  value={pwInput}
                  onChange={handlePwInputChange}
                  onKeyDown={handlePwKeyDown}
                  autoFocus
                />
                <InputRightElement width="4rem">
                  <Button
                    h="1.5rem"
                    size="xs"
                    onClick={handleTogglePw}
                    variant="ghost"
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{pwError}</FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleUnlock} w="full">
              Buka
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Student detail modal */}
      <Modal
        isOpen={!!selected}
        onClose={handleCloseDetailModal}
        isCentered
        size="md"
      >
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader pb={2}>
            <Text fontSize="lg" fontWeight="bold" color={headingColor}>
              {selected?.student.name}
            </Text>
            {selected?.student.kode_registrasi && (
              <Badge colorScheme="blue" fontSize="xs" mt={1}>
                {selected.student.kode_registrasi}
              </Badge>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              {selected?.student.academic_year && (
                <HStack>
                  <Text fontSize="sm" color={modalLabelColor} minW="110px">
                    Tahun Masuk
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                    {selected.student.academic_year}
                  </Text>
                </HStack>
              )}
              <HStack align="flex-start">
                <Text fontSize="sm" color={modalLabelColor} minW="110px">
                  Kelas
                </Text>
                <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                  {selected?.className}
                </Text>
              </HStack>
              {(selected?.student.ayah || selected?.student.bunda) && (
                <>
                  <Divider />
                  {selected?.student.ayah && (
                    <HStack>
                      <Text fontSize="sm" color={modalLabelColor} minW="110px">
                        Ayah
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={headingColor}
                      >
                        {selected.student.ayah}
                      </Text>
                    </HStack>
                  )}
                  {selected?.student.bunda && (
                    <HStack>
                      <Text fontSize="sm" color={modalLabelColor} minW="110px">
                        Bunda
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={headingColor}
                      >
                        {selected.student.bunda}
                      </Text>
                    </HStack>
                  )}
                </>
              )}
              {selected?.student.siblings &&
                selected.student.siblings.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color={modalLabelColor} mb={2}>
                        Saudara
                      </Text>
                      <VStack align="stretch" spacing={1}>
                        {selected.student.siblings.map((sib) => (
                          <Box
                            key={sib.name}
                            px={3}
                            py={2}
                            borderRadius="md"
                            bg={siblingBg}
                          >
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color={siblingColor}
                            >
                              {sib.name}
                            </Text>
                            <Text fontSize="xs" color={modalLabelColor}>
                              {sib.class}
                              {sib.academic_year
                                ? ` · Masuk ${sib.academic_year}`
                                : ''}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </>
                )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <DataChatBox
        title="Tanya Data Santri"
        hint="Tanyakan apa saja tentang santri, guru, dan kelas pada TA 2026/2027."
        loadingSteps={[
          'Menghubungi data santri 2026/2027...',
          'Mencari guru & kelas...',
          'Mengolah konteks...',
          'Menyusun jawaban...',
        ]}
      />
    </>
  );
}

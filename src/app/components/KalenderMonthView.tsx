'use client';

import {
  Box,
  HStack,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import type {
  KalenderEvent,
  KalenderHoliday,
  KalenderKategori,
} from '~/lib/utils/kalender';
import {
  KATEGORI_COLOR,
  KATEGORI_LABEL,
  formatRentang,
  formatTanggal,
  parseDateISO,
  startOfDay,
} from '~/lib/utils/kalender';

import PicWhatsAppLinks from './PicWhatsAppLinks';

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

type Cell = {
  date: Date;
  day: number;
  inMonth: boolean;
  events: KalenderEvent[];
  holidays: KalenderHoliday[];
};

export default function KalenderMonthView({
  events,
  holidays,
  targetDate,
  highlightKeys,
}: {
  events: KalenderEvent[];
  holidays: KalenderHoliday[];
  targetDate?: string;
  highlightKeys?: Set<string>;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [selected, setSelected] = useState<Date | null>(today);

  useEffect(() => {
    if (!targetDate) return;
    const d = parseDateISO(targetDate);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(startOfDay(d));
  }, [targetDate]);

  const gridBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const todayBg = useColorModeValue('blue.500', 'blue.400');
  const selectedBg = useColorModeValue('purple.500', 'purple.400');
  const selectedColor = 'white';
  const selectedBgSoft = useColorModeValue('purple.50', 'purple.900');
  const todayText = useColorModeValue('white', 'white');
  const dimmed = useColorModeValue('gray.400', 'gray.500');
  const detailBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const cells = useMemo<Cell[]>(() => {
    const { year, month } = cursor;
    const total = daysInMonth(year, month);
    const first = new Date(year, month, 1);
    const leading = first.getDay(); // 0=Min
    const list: Cell[] = [];

    for (let i = 0; i < leading; i += 1) {
      const d = new Date(year, month, -leading + 1 + i);
      list.push({
        date: d,
        day: d.getDate(),
        inMonth: false,
        events: [],
        holidays: [],
      });
    }
    for (let day = 1; day <= total; day += 1) {
      const d = new Date(year, month, day);
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const evs = events.filter((e) => {
        const s = parseDateISO(e.start);
        const end = e.end ? parseDateISO(e.end) : s;
        return s.getTime() <= d.getTime() && d.getTime() <= end.getTime();
      });
      const hols = holidays.filter((h) => {
        const end = h.end || h.start;
        return h.start <= iso && iso <= end;
      });
      list.push({ date: d, day, inMonth: true, events: evs, holidays: hols });
    }
    while (list.length % 7 !== 0) {
      const last = list[list.length - 1].date;
      const d = new Date(
        last.getFullYear(),
        last.getMonth(),
        last.getDate() + 1
      );
      list.push({
        date: d,
        day: d.getDate(),
        inMonth: false,
        events: [],
        holidays: [],
      });
    }
    return list;
  }, [cursor, events, holidays]);

  const label = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    'id-ID',
    {
      month: 'long',
      year: 'numeric',
    }
  );

  const weeks = useMemo(() => {
    const rows: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [cells]);

  const goMonth = (delta: number) => {
    setCursor((prev) => {
      const m = prev.month + delta;
      const year = prev.year + Math.floor(m / 12);
      const month = ((m % 12) + 12) % 12;
      return { year, month };
    });
  };

  const selectedCell = cells.find(
    (c) =>
      selected &&
      c.date.getTime() === startOfDay(selected).getTime() &&
      c.inMonth
  );

  const isSelected = (cell: Cell) =>
    selected && cell.date.getTime() === selected.getTime() && cell.inMonth;

  const selectedLabel = selected
    ? selected.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <VStack align="stretch" spacing={3}>
      <HStack justify="space-between">
        <IconButton
          aria-label="Bulan sebelumnya"
          icon={<FaChevronLeft />}
          size="sm"
          variant="ghost"
          onClick={() => goMonth(-1)}
        />
        <Text fontWeight="bold" fontSize="md">
          {label}
        </Text>
        <IconButton
          aria-label="Bulan berikutnya"
          icon={<FaChevronRight />}
          size="sm"
          variant="ghost"
          onClick={() => goMonth(1)}
        />
      </HStack>

      <Box
        bg={gridBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gridAutoRows: 'auto',
        }}
      >
        {DAY_NAMES.map((d) => (
          <Box
            key={d}
            py={2}
            textAlign="center"
            fontSize="xs"
            fontWeight="bold"
            color={muted}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            {d}
          </Box>
        ))}

        {weeks.flat().map((cell) => {
          const isToday =
            cell.inMonth && cell.date.getTime() === today.getTime();
          const dayKey = cell.date.toISOString();
          const isSel = isSelected(cell);
          let dateColor = muted;
          let dateBg: string | undefined;
          if (isSel) {
            dateColor = selectedColor;
            dateBg = selectedBg;
          } else if (isToday) {
            dateColor = todayText;
            dateBg = todayBg;
          }
          return (
            <Box
              key={dayKey}
              sx={{
                minWidth: 0,
                height: '76px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid',
                borderBottom: '1px solid',
                borderColor,
                cursor: cell.inMonth ? 'pointer' : 'default',
                bg: isSel ? selectedBgSoft : undefined,
                opacity: cell.inMonth ? 1 : 0.45,
                '&:hover': {
                  bg: cell.inMonth ? hoverBg : undefined,
                },
              }}
              onClick={() => {
                if (!cell.inMonth) return;
                setSelected(startOfDay(cell.date));
                const d = cell.date;
                if (
                  d.getMonth() !== cursor.month ||
                  d.getFullYear() !== cursor.year
                ) {
                  setCursor({ year: d.getFullYear(), month: d.getMonth() });
                }
              }}
            >
              <Box px={1} pt={0.5}>
                <Text
                  as="span"
                  fontSize="xs"
                  fontWeight={isToday ? 'bold' : 'normal'}
                  color={dateColor}
                  bg={dateBg}
                  borderRadius="full"
                  w="22px"
                  h="22px"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {cell.day}
                </Text>
              </Box>

              <Box
                px={1}
                pb={0.5}
                flex={1}
                minH={0}
                overflow="hidden"
                display="flex"
                flexDirection="column"
                gap="2px"
              >
                {cell.inMonth &&
                  cell.holidays.slice(0, 2).map((h) => (
                    <Badge
                      key={`holiday-${h.name}-${h.start}`}
                      fontSize="8.5px"
                      lineHeight="1.2"
                      colorScheme="red"
                      variant="subtle"
                      overflow="hidden"
                      whiteSpace="nowrap"
                      textOverflow="ellipsis"
                      display="block"
                      maxW="100%"
                    >
                      {h.name}
                    </Badge>
                  ))}
                {cell.inMonth &&
                  cell.events
                    .slice(0, Math.max(0, 2 - cell.holidays.length))
                    .map((e) => {
                      const key = `${e.name}-${e.start}`;
                      const highlighted = highlightKeys?.has(key);
                      return (
                        <Badge
                          key={key}
                          fontSize="8.5px"
                          lineHeight="1.2"
                          colorScheme={
                            KATEGORI_COLOR[e.category as KalenderKategori]
                          }
                          variant={highlighted ? 'solid' : 'subtle'}
                          overflow="hidden"
                          whiteSpace="nowrap"
                          textOverflow="ellipsis"
                          display="block"
                          maxW="100%"
                        >
                          {e.name}
                        </Badge>
                      );
                    })}
                {cell.inMonth &&
                  cell.holidays.length + cell.events.length > 2 && (
                    <Text fontSize="8.5px" color={dimmed} noOfLines={1}>
                      +{cell.holidays.length + cell.events.length - 2} lainnya
                    </Text>
                  )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Detail hari yang dipilih */}
      <Box
        bg={detailBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={4}
        minH="80px"
      >
        {selectedCell &&
        (selectedCell.events.length > 0 || selectedCell.holidays.length > 0) ? (
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" fontWeight="bold" color={muted}>
              {selectedLabel}
            </Text>
            {selectedCell.holidays.map((h) => {
              const holidayRange = h.end
                ? `${formatTanggal(h.start)} – ${formatTanggal(h.end)}`
                : formatTanggal(h.start);
              return (
                <Box key={`${h.name}-${h.start}`}>
                  <Badge colorScheme="red" variant="subtle" fontSize="xs">
                    Libur
                  </Badge>
                  <Text fontSize="sm" display="inline" ml={2}>
                    {h.name}
                  </Text>
                  <Text fontSize="xs" color={muted} mt={0.5}>
                    {holidayRange}
                    {h.note && h.note !== 'resmi' ? ` · ${h.note}` : ''}
                  </Text>
                </Box>
              );
            })}
            {selectedCell.events.map((ev, idx) => (
              <Box key={`${ev.name}-${ev.start}`}>
                {idx > 0 && <Divider my={2} />}
                <HStack justify="space-between" align="start" spacing={2}>
                  <Text fontWeight="bold" fontSize="sm">
                    {ev.name}
                  </Text>
                  <Badge
                    colorScheme={
                      KATEGORI_COLOR[ev.category as KalenderKategori]
                    }
                    variant="subtle"
                    fontSize="10px"
                    flexShrink={0}
                  >
                    {KATEGORI_LABEL[ev.category as KalenderKategori]}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={muted} mt={0.5}>
                  {formatRentang(ev)}
                </Text>
                {ev.pic && (
                  <Text fontSize="xs" color={muted} mt={1}>
                    PIC: <PicWhatsAppLinks value={ev.pic} />
                  </Text>
                )}
                {ev.committee && (
                  <Text fontSize="xs" color={muted} mt={0.5}>
                    Penanggung jawab: {ev.committee}
                  </Text>
                )}
                {ev.desc && (
                  <Text fontSize="sm" mt={1.5} lineHeight="1.5">
                    {ev.desc}
                  </Text>
                )}
                {ev.target && (
                  <Text fontSize="xs" color={muted} mt={1}>
                    Sasaran: {ev.target}
                  </Text>
                )}
              </Box>
            ))}
          </VStack>
        ) : (
          <Text fontSize="sm" color={muted}>
            Klik sebuah tanggal untuk melihat kegiatannya.
          </Text>
        )}
      </Box>

      <HStack spacing={3} wrap="wrap" fontSize="xs" color={muted}>
        {(['event', 'rutin', 'insidential'] as KalenderKategori[]).map((k) => (
          <HStack key={k} spacing={1}>
            <Badge colorScheme={KATEGORI_COLOR[k]} variant="subtle">
              {KATEGORI_LABEL[k]}
            </Badge>
          </HStack>
        ))}
        <HStack spacing={1}>
          <Badge colorScheme="red" variant="subtle">
            Libur
          </Badge>
        </HStack>
      </HStack>
    </VStack>
  );
}

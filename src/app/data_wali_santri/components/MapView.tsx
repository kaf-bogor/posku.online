'use client';

import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import type {
  MarkerClusterer,
  MarkerClustererOptions,
} from '@googlemaps/markerclusterer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiMapPin, FiAlertCircle } from 'react-icons/fi';

import {
  GOOGLE_MAPS_API_KEY,
  BOGOR_CENTER,
  MAP_INITIAL_ZOOM,
} from '~/lib/config/maps';
import type {
  KategoriUtama,
  DataWaliSantriRecord,
} from '~/lib/types/data_wali_santri';
import {
  childClassPairs,
  KATEGORI_HEX,
  KATEGORI_META,
  KATEGORI_ORDER,
} from '~/lib/utils/waliSantriMeta';

const PIN_SVG = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M17 0C8 0 1 7 1 16c0 12 16 28 16 28s16-16 16-28C33 7 26 0 17 0z"/><circle cx="17" cy="16" r="7" fill="#ffffff" opacity="0.9"/><circle cx="17" cy="16" r="4" fill="${color}"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Keep the map clean: hide POIs (cafes, hotels, shops, etc.) and transit so only
// street / neighborhood names and roads are visible.
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

type GoogleMap = google.maps.Map;
type GoogleMarker = google.maps.Marker;
type GoogleInfoWindow = google.maps.InfoWindow;

let mapsPromise: Promise<void> | null = null;

function ensureGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Bukan lingkungan browser'));
  }
  if (window.google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const callbackName = '__poskuGmapsCallback';
    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve();
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.onerror = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      mapsPromise = null;
      reject(new Error('Gagal memuat skrip Google Maps'));
    };
    document.head.appendChild(script);
  });
  return mapsPromise;
}

function clean(v: string | null | undefined): string {
  if (!v) return '';
  return v.replace(/^[-.\s]+|[-.\s]+$/g, '').trim();
}

const MapView = ({
  records,
  onFilter,
}: {
  records: DataWaliSantriRecord[];
  onFilter: (m: KategoriUtama | 'semua') => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const clusterRef = useRef<MarkerClusterer | null>(null);
  const infoRef = useRef<GoogleInfoWindow | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const markerToRecordRef = useRef<Map<GoogleMarker, DataWaliSantriRecord>>(
    new Map()
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const legendBg = useColorModeValue('white', 'gray.800');

  // Init map once
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        await ensureGoogleMaps();
        if (cancelled || !containerRef.current) return;
        const map = new google.maps.Map(containerRef.current, {
          center: BOGOR_CENTER,
          zoom: MAP_INITIAL_ZOOM,
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          styles: MAP_STYLES,
        });
        mapRef.current = map;
        infoRef.current = new google.maps.InfoWindow({
          maxWidth: 260,
          pixelOffset: new google.maps.Size(0, -32),
        });
        // Close the info window when tapping the map background
        map.addListener('click', () => infoRef.current?.close());
        if (!cancelled) setMapReady(true);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Gagal memuat peta'
          );
        }
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildContent = useCallback((r: DataWaliSantriRecord) => {
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'font-family:system-ui,sans-serif;font-size:13px;line-height:1.5;min-width:170px;max-width:250px;color:#1a202c;';
    // Header with title + close button
    const header = document.createElement('div');
    header.style.cssText =
      'display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px;';
    const titleWrap = document.createElement('div');
    titleWrap.style.cssText = 'min-width:0;';
    const title = document.createElement('div');
    title.style.cssText =
      'font-weight:700;font-size:14px;line-height:1.3;word-break:break-word;';
    const ayah = clean(r.nama_ayah);
    const ibu = clean(r.nama_ibu);
    title.textContent = [ayah, ibu].filter(Boolean).join(' & ') || 'Walisantri';
    const sub = r.subkategori;
    const katLabel = sub
      ? `${KATEGORI_META[r.kategori].label} · ${sub}`
      : KATEGORI_META[r.kategori].label;
    const badge = document.createElement('div');
    badge.style.cssText =
      'font-size:11px;font-weight:600;color:#2B6CB0;margin-top:2px;';
    badge.textContent = katLabel;
    titleWrap.appendChild(title);
    titleWrap.appendChild(badge);
    header.appendChild(titleWrap);
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Tutup');
    close.textContent = '✕';
    close.style.cssText =
      'flex:0 0 auto;width:30px;height:30px;display:flex;align-items:center;justify-content:center;' +
      'border:none;border-radius:50%;background:#edf2f7;color:#4a5568;font-size:14px;cursor:pointer;' +
      'touch-action:manipulation;';
    close.onclick = () => infoRef.current?.close();
    header.appendChild(close);
    wrap.appendChild(header);

    const add = (el: string, bold = false) => {
      const p = document.createElement('p');
      p.style.cssText = `margin:2px 0;${bold ? 'font-weight:700;' : ''}`;
      p.textContent = el;
      wrap.appendChild(p);
    };
    const job = clean(r.pekerjaan_utama_ayah);
    const instansi = clean(r.nama_instansi);
    if (job || instansi) add([job, instansi].filter(Boolean).join(' — '));
    childClassPairs(r).forEach(({ name, kelas }) => {
      const line = document.createElement('p');
      line.style.cssText = 'margin:1px 0;';
      const nameNode = document.createTextNode(name ? `${name} — ` : '');
      const kelasNode = document.createElement('b');
      kelasNode.textContent = kelas || '';
      line.appendChild(nameNode);
      line.appendChild(kelasNode);
      wrap.appendChild(line);
    });
    const alamat = clean(r.alamat_rumah);
    if (alamat) {
      const addr = document.createElement('p');
      addr.style.cssText =
        'margin:2px 0;color:#4a5568;white-space:pre-line;word-break:break-word;';
      addr.textContent = alamat;
      wrap.appendChild(addr);
    }
    const bersedia = clean(r.ayah_bersedia_posku);
    if (bersedia) add(`POSKU: ${bersedia}`);

    // Google Maps directions (only action, keeps tooltip clean).
    const hasCoords = typeof r.lat === 'number' && typeof r.lon === 'number';
    const dirHref = hasCoords
      ? `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          alamat
        )}`;
    const dirBtn = document.createElement('a');
    dirBtn.href = dirHref;
    dirBtn.target = '_blank';
    dirBtn.rel = 'noopener noreferrer';
    dirBtn.textContent = 'Petunjuk Arah';
    dirBtn.style.cssText =
      'display:flex;align-items:center;justify-content:center;width:100%;' +
      'margin-top:8px;padding:8px 12px;border-radius:10px;text-decoration:none;' +
      'font-size:13px;font-weight:700;color:#fff;background:#188038;' +
      'box-sizing:border-box;touch-action:manipulation;';
    wrap.appendChild(dirBtn);
    return wrap;
  }, []);

  // Build the content shown when a cluster is clicked: it lists every wali
  // santri that belongs to that cluster with its own directions link.
  const buildClusterContent = useCallback((members: DataWaliSantriRecord[]) => {
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'font-family:system-ui,sans-serif;font-size:13px;line-height:1.5;' +
      'min-width:200px;max-width:280px;color:#1a202c;';
    const header = document.createElement('div');
    header.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;';
    const title = document.createElement('div');
    title.style.cssText = 'font-weight:700;font-size:14px;';
    title.textContent = `${members.length} Wali Santri`;
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Tutup');
    close.textContent = '✕';
    close.style.cssText =
      'flex:0 0 auto;width:30px;height:30px;display:flex;align-items:center;justify-content:center;' +
      'border:none;border-radius:50%;background:#edf2f7;color:#4a5568;font-size:14px;cursor:pointer;' +
      'touch-action:manipulation;';
    close.onclick = () => infoRef.current?.close();
    header.appendChild(title);
    header.appendChild(close);
    wrap.appendChild(header);

    const list = document.createElement('div');
    list.style.cssText =
      'max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;';
    members.forEach((r) => {
      const row = document.createElement('div');
      row.style.cssText =
        'display:flex;justify-content:space-between;align-items:center;gap:6px;' +
        'padding:5px 8px;border-radius:8px;background:#f7fafc;';
      const info = document.createElement('div');
      info.style.cssText = 'min-width:0;';
      const name = document.createElement('div');
      name.style.cssText = 'font-weight:600;word-break:break-word;';
      const ayah = clean(r.nama_ayah);
      const ibu = clean(r.nama_ibu);
      name.textContent =
        [ayah, ibu].filter(Boolean).join(' & ') || 'Walisantri';
      const sub = r.subkategori;
      const katLabel = sub
        ? `${KATEGORI_META[r.kategori].label} · ${sub}`
        : KATEGORI_META[r.kategori].label;
      const badge = document.createElement('div');
      badge.style.cssText =
        'font-size:10px;font-weight:600;color:#2B6CB0;margin-top:1px;';
      badge.textContent = katLabel;
      info.appendChild(name);
      info.appendChild(badge);
      row.appendChild(info);
      const hasCoords = typeof r.lat === 'number' && typeof r.lon === 'number';
      const dirHref = hasCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            clean(r.alamat_rumah)
          )}`;
      const dir = document.createElement('a');
      dir.href = dirHref;
      dir.target = '_blank';
      dir.rel = 'noopener noreferrer';
      dir.textContent = 'Arah';
      dir.style.cssText =
        'flex:0 0 auto;padding:4px 10px;border-radius:999px;text-decoration:none;' +
        'font-size:11px;font-weight:700;color:#fff;background:#188038;touch-action:manipulation;';
      row.appendChild(dir);
      list.appendChild(row);
    });
    wrap.appendChild(list);
    return wrap;
  }, []);

  // Rebuild markers when map ready / records change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return undefined;
    infoRef.current?.close();
    let cancelled = false;

    (async () => {
      try {
        const { MarkerClusterer } = await import('@googlemaps/markerclusterer');
        if (cancelled) return;

        const withGeo = records.filter(
          (r) => typeof r.lat === 'number' && typeof r.lon === 'number'
        );
        const markers: GoogleMarker[] = withGeo.map((r) => {
          const marker = new google.maps.Marker({
            position: { lat: r.lat as number, lng: r.lon as number },
            icon: {
              url: PIN_SVG(KATEGORI_HEX[r.kategori]),
              size: new google.maps.Size(34, 44),
              scaledSize: new google.maps.Size(28, 36),
              anchor: new google.maps.Point(14, 36),
            },
            title: [clean(r.nama_ayah), clean(r.nama_ibu)]
              .filter(Boolean)
              .join(' & '),
          });
          marker.addListener('click', () => {
            if (infoRef.current) {
              infoRef.current.setContent(buildContent(r));
              infoRef.current.open(map, marker);
            }
          });
          markerToRecordRef.current.set(marker, r);
          return marker;
        });
        // drop stale marker->record entries
        Array.from(markerToRecordRef.current.keys()).forEach((m) => {
          if (!markers.includes(m)) markerToRecordRef.current.delete(m);
        });
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = markers;

        // Reuse one clusterer; clear then add the updated marker set.
        const onClusterClick: NonNullable<
          MarkerClustererOptions['onClusterClick']
        > = (event, cluster) => {
          const members = cluster.markers
            .map((m) =>
              markerToRecordRef.current.get(m as unknown as GoogleMarker)
            )
            .filter((r): r is DataWaliSantriRecord => Boolean(r));
          if (!members.length || !infoRef.current) return;
          infoRef.current.setContent(buildClusterContent(members));
          infoRef.current.open(map);
          infoRef.current.setPosition(
            event.latLng ?? cluster.position ?? map.getCenter()
          );
        };
        if (clusterRef.current) {
          clusterRef.current.clearMarkers();
          clusterRef.current.addMarkers(markers);
        } else {
          clusterRef.current = new MarkerClusterer({
            map,
            markers,
            onClusterClick,
          });
        }
      } catch {
        setLoadError('Gagal memuat klaster marker peta.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [records, mapReady, buildContent, buildClusterContent]);

  const legend = KATEGORI_ORDER.filter((k) => k !== 'belum_terisi');

  return (
    <VStack align="stretch" spacing={3}>
      {/* Legenda + shortcut filter */}
      <HStack spacing={3} wrap="wrap">
        <HStack spacing={1}>
          <Icon as={FiMapPin} color="red.500" />
          <Text fontWeight="semibold" fontSize="sm">
            Legenda:
          </Text>
        </HStack>
        {legend.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onFilter(k)}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <HStack
              spacing={1.5}
              bg={legendBg}
              borderRadius="full"
              px={2.5}
              py={1}
              border="1px solid"
              borderColor="gray.200"
            >
              <Box w={3} h={3} borderRadius="full" bg={KATEGORI_HEX[k]} />
              <Text fontSize="xs" fontWeight="medium">
                {KATEGORI_META[k].label}
              </Text>
            </HStack>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onFilter('semua')}
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <HStack
            spacing={1.5}
            bg={legendBg}
            borderRadius="full"
            px={2.5}
            py={1}
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="xs" fontWeight="medium">
              Tampilkan Semua
            </Text>
          </HStack>
        </button>
      </HStack>

      <Box
        ref={containerRef}
        h={{ base: '60vh', md: '70vh' }}
        w="100%"
        borderRadius="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.200"
      >
        {loadError && (
          <VStack h="100%" justify="center" align="center" spacing={3}>
            <Icon as={FiAlertCircle} boxSize={8} color="red.400" />
            <Text color="red.400" fontSize="sm" textAlign="center" px={6}>
              Gagal memuat Google Maps: {loadError}
            </Text>
          </VStack>
        )}
      </Box>
      <Text fontSize="xs" color="gray.500">
        Titik lokasi merupakan perkiraan (hasil geocode dari alamat). Klik
        marker untuk melihat detail keluarga.
      </Text>
    </VStack>
  );
};

export default MapView;

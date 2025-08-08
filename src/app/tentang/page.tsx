'use client';

import {
  Fade,
  Flex,
  Text,
  VStack,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md';

import BackButton from '~/app/components/BackButton';

const TentangPage = () => {
  return (
    <Fade in>
      <BackButton />

      <VStack align="start" gap={8}>
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" fontSize="24px">
            Pengertian
          </Text>
          <Text>
            POSKU Al Fatih adalah singkatan dari Persatuan Orang tua Santri
            Kuttab Al Fatih. POSKU adalah lembaga informal yg bertugas
            mengkoordinir Orang Tua Santri Kuttab Al Fatih (OTS KAF) dalam
            berbagai aktifitas yg mendukung kegiatan belajar mengajar (KBM)
            santri di KAF Bogor.
          </Text>
        </VStack>
        <VStack align="start">
          <Text fontWeight="bold" fontSize="24px">
            Tujuan
          </Text>
          <Text>
            Setiap OTS KAF memahami bahwa kewajiban pendidikan anak adalah
            tanggung jawab orang tua, dan diantara bagian penting dari tanggung
            jawab ini adalah orang tua berikhtiar mencari sekolah dan guru-guru
            yang baik yang mampu membantu orang tua dalam melaksanakan tugas
            mendidik anak-anak ini. Oleh karena itu POSKU dibentuk untuk
            mengoptimalkan dan memaksimalkan kontribusi OTS dalam pendidikan
            anaknya di KAF.
          </Text>
        </VStack>
        <VStack align="start">
          <Text fontWeight="bold" fontSize="24px">
            Tugas & Tanggung Jawab
          </Text>
          <Flex direction="column" mb={3}>
            <Text fontStyle="italic" fontWeight="bold">
              Fungsi Komunikasi
            </Text>
            <Text>
              POSKU diharapkan dapat menjembatani komunikasi antara Kuttab dan
              OTS sehingga komunikasi menjadi efektif dan efisien. Dengan
              demikian OTS tidak harus selalu berkomunikasi langsung dengan
              Manajemen Kuttab untuk berdiskusi tentang setiap hal. Hal-hal
              tertentu cukup dikomunikasikan oleh manajemen Kuttab kepada OTS
              melalui pengurus POSKU dan demikian juga sebaliknya. Adapun untuk
              hal-hal khusus yang menyangkut santri tertentu, masing-masing OTS
              tetap dapat langsung berkomunikasi dengan Manajemen Kuttab secara
              langsung.
            </Text>
          </Flex>
          <Flex direction="column" mb={3}>
            <Text fontStyle="italic" fontWeight="bold">
              Fungsi Koordinasi
            </Text>
            <Text>
              POSKU diharapkan dapat melakukan koordinasi dengan seluruh OTS
              terkait kegiatan Kuttab dan kegiatan POSKU yang melibatkan OTS.
              Dengan adanya POSKU, simpul-simpul koordinasi diharapkan dapat
              lebih sederhana dan dapat dilakukan dalam skala yang lebih kecil.
            </Text>
          </Flex>
          <Flex direction="column" mb={3}>
            <Text fontStyle="italic" fontWeight="bold">
              Fungsi Fasilitasi & Kolaborasi
            </Text>
            <Text>
              POSKU diharapkan dapat memfasilitasi pendayagunaan potensi OTS
              yang beragam dalam berbagai bentuk kegiatan Kuttab dan POSKU.
              Potensi yang dimaksud dapat berupa ilmu, ide, keahlian, waktu,
              harta, jaringan, tenaga, jasa dan lain sebagainya. POSKU mendorong
              kerjasama segenap OTS dan berbagai potensinya untuk melahirkan ide
              dan kegiatan yang akan memberikan nilai tambah bagi keluarga besar
              KAF
            </Text>
          </Flex>
          <Flex direction="column" mb={3}>
            <Text fontStyle="italic" fontWeight="bold">
              Fungsi Sharing & Inspirasi
            </Text>
            <Text>
              POSKU bertugas menjembatani antar sesama OTS KAF sehingga dalam
              forum-forum yang digagas oleh POSKU, OTS bisa saling belajar dan
              mendapatkan inspirasi dari pengetahuan dan pengalaman satu sama
              lain. Proses interaksi dan sharing diharapkan dapat mempercepat
              kesamaan pemahaman antara OTS KAF, sehingga memberikan dampak yang
              lebih optimal bagi pendidikan anak-anak.
            </Text>
          </Flex>
        </VStack>
        <VStack align="start">
          <Text fontWeight="bold" fontSize="24px">
            Program Kerja POSKU (Contoh)
          </Text>
          <List spacing={4}>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Mendukung & membantu rangkaian kegiatan belajar mengajar santri
              KAF
            </ListItem>
            Menjadi perwakilan OTS dan menjembatani komunikasi dengan manajemen
            KAF dan menyampaikan informasi resmi dari KAF ke OTS
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Membuat web/blog komunikasi POSKU & SMS BLAST untuk OTS untuk
              kegiatan KAF & POSKU
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Bekerjasama dengan KAF dalam menjaga kebersihan & kesehatan
              lingkungan KAF
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Mendukung kegiatan Kajian Rutin OTS ayah/bunda KAF setiap bulan
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Menyelenggarakan kegiatan ayah belajar bahasa arab, tajwid &
              tahsin
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Menyelenggarakan Kajian Adab dan Akhlak{' '}
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Membentuk Korlas (Koordinator Kelas) dari pihak OTS dan
              menyelenggarakan kegiatan
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Family to family (F2F) di tiap kelas{' '}
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Menyelenggarakan kegiatan camping & olah raga bersama santri & OTS
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Mendukung kegiatan BAZAR AL FATIH dengan menghimbau OTS #gerakan
              beli di Toko Bazar
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Menyelenggarakan Forum Wirausaha & Mentoring, pelatihan bisnis
              bagi OTS
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Bekerjasama dengan Bazar Al Fatih & menyelenggarakan Kajian Fiqh
              Muamalah
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Mengkoordinir Kegiatan Ifthor Jama’i pada bulan Ramadhan
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              Mendukung & berpartisipasi kegiatan I’tikaf Ramadhan di Bulan
              Ramadhan
            </ListItem>
          </List>
        </VStack>
      </VStack>
    </Fade>
  );
};

export default TentangPage;

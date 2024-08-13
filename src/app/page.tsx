import { Button, HStack, Tooltip, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { CiMail, CiChat1, CiLink } from 'react-icons/ci';

const links: {
  label: string;
  href: string;
}[] = [
  {
    label: 'Tentang Posku',
    href: '/tentang',
  },
  {
    label: 'Pengurus POSKU',
    href: '/pengurus',
  },
  {
    label: 'Kuttab Al-Fatih Bogor',
    href: 'https://www.instagram.com/kuttabalfatihbogor/',
  },
  {
    label: "Donasi Ta'awun",
    href: '/donasi',
  },
  {
    label: 'Saran & Masukan',
    href: 'https://docs.google.com/forms/d/e/1FAIpQLSeRZ39Pv9lDt5qaNfOm66Y74OC5KCD3qlearq_KpogcdSwRnA/viewform',
  },
];

const Home = () => {
  return (
    <>
      <HStack mb={6} mt={4} gap={6}>
        <Tooltip hasArrow aria-label="Email" label="Email" placement="bottom">
          <Link href="mailto:poskukafbogor@gmail.com">
            <CiMail size="32px" />
          </Link>
        </Tooltip>
        <Tooltip
          hasArrow
          aria-label="Whatsapp"
          label="Whatsapp"
          placement="bottom"
        >
          <Link href="https://wa.me/+62811186535">
            <CiChat1 size="32px" />
          </Link>
        </Tooltip>
        <Tooltip
          hasArrow
          aria-label="Website"
          label="Website"
          placement="bottom"
        >
          <Link href="https://posku.online">
            <CiLink size="32px" />
          </Link>
        </Tooltip>
      </HStack>
      <VStack gap={[6, 3]}>
        {links.map(({ href, label }) => (
          <Link href={href} key={href}>
            <Button w={['90vw', '400px']}>{label}</Button>
          </Link>
        ))}
      </VStack>
    </>
  );
};

export default Home;

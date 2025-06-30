import { Button, VStack } from '@chakra-ui/react';
import Link from 'next/link';

// Server component
const Home = async () => {
    const mainLinks: MainLink[] = [
        {
            label: 'Pendaftaran Program Ta’awun Tali Asih POSKU',
            href: 'https://bit.ly/posku-tali-asih',
        },
        {
            label: 'Saran & Masukan',
            href: 'https://bit.ly/posku-saran-masukan',
        },
        {
            label: 'Formulir data wali santri',
            href: 'https://forms.gle/CCNE2XC4s5t8HALz8',
        },
        {
            label: 'IG Kuttab Al-Fatih Bogor',
            href: 'https://www.instagram.com/posku_bogor/',
        },
        {
            href: 'https://www.instagram.com/poskukuttabalfatihbogor',
            label: 'Instagram POSKU',
        },
        {
            href: 'https://wa.me/+6285710123686',
            label: 'Whatsapp qowamah',
        },
        {
            href: 'https://wa.me/+628119118212',
            label: 'Whatsapp ummahat',
        },
        {
            href: 'https://sites.google.com/view/kafbogor',
            label: 'Website',
        },
    ];

    return (
        <VStack gap={[6, 3]}>
            {mainLinks.map(({ href, label }) => (
                <Link href={href} key={href}>
                    <Button w={['90vw', '400px']}>{label}</Button>
                </Link>
            ))}
        </VStack>
    );
};

export default Home;

type MainLink = { href: string; label: string };

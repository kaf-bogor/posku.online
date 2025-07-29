import {
  HStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import Link from 'next/link';
import type { IconType } from 'react-icons';
import { FaChevronRight } from 'react-icons/fa';

interface SectionHeaderProps {
  title: string;
  icon?: IconType;
  viewAllLink?: string;
  viewAllText?: string;
}

const SectionHeader = ({
  title,
  icon,
  viewAllLink,
  viewAllText = 'Lihat Semua',
}: SectionHeaderProps) => {
  const titleColor = useColorModeValue('gray.800', 'white');
  const linkColor = useColorModeValue('purple.600', 'purple.300');

  return (
    <HStack justify="space-between" align="center" mb={3}>
      <HStack spacing={2}>
        {icon && <Icon as={icon} color={linkColor} fontSize="lg" />}
        <Text fontSize="lg" fontWeight="bold" color={titleColor}>
          {title}
        </Text>
      </HStack>
      {viewAllLink && (
        <Link href={viewAllLink} passHref>
          <Button
            as="a"
            variant="ghost"
            color={linkColor}
            size="sm"
            rightIcon={<FaChevronRight />}
            _hover={{
              bg: useColorModeValue('purple.50', 'purple.900'),
            }}
          >
            {viewAllText}
          </Button>
        </Link>
      )}
    </HStack>
  );
};

export default SectionHeader;

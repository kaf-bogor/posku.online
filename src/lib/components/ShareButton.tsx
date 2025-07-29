'use client';

import {
  Button,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Input,
  HStack,
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaShareAlt, FaFacebook, FaWhatsapp } from 'react-icons/fa';

const ShareButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [pathname]);

  return (
    <>
      <IconButton icon={<FaShareAlt />} aria-label="Share" onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bagikan halaman ini</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4} p={6}>
              <Button
                leftIcon={<FaFacebook />}
                colorScheme="facebook"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
                      '_blank'
                    );
                  }
                }}
              >
                Bagikan ke Facebook
              </Button>
              <Button
                leftIcon={<FaWhatsapp />}
                colorScheme="whatsapp"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(
                      `https://api.whatsapp.com/send?text=${encodeURIComponent(currentUrl)}`,
                      '_blank'
                    );
                  }
                }}
              >
                Bagikan ke WhatsApp
              </Button>
              <HStack spacing={2}>
                <Input
                  isReadOnly
                  value={currentUrl}
                  placeholder="Link untuk dibagikan"
                />
                <CopyToClipboard text={currentUrl}>
                  <Button>Copy Link</Button>
                </CopyToClipboard>
              </HStack>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShareButton;

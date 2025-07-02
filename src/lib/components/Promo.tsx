import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Image,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';

import { storageUrl } from '~/lib/context/baseUrl';

export default function Promo() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent w="100vw" h="100vh" bg="none">
        <ModalBody
          p={0}
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <Image
            src={`${storageUrl}/promo%20maqom%202025.webp?alt=media`}
            alt="Promo"
            objectFit="contain"
            w="500px"
            onClick={onClose}
            cursor="pointer"
            border="2px solid white"
            borderRadius="20px"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

'use client';

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Link,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useContext, useEffect } from 'react';

import ContentWrapper from '~/app/components/ContentWrapper';
import { AppContext, siteConfig } from '~/lib/context/app';
import { storageUrl } from '~/lib/context/baseUrl';
import data from '~/lib/data/muslimah_center.json';

const MuslimahCenterPage = () => {
  const { image, title, subtitle, setImage, setTitle, setSubtitle } =
    useContext(AppContext);

  const logoUrl = useColorModeValue(
    `${storageUrl}/mc_light.png?alt=media`,
    `${storageUrl}/mc_dark.png?alt=media`
  );

  const accordionBg = useColorModeValue('gray.100', 'gray.700');
  const accordionHoverBg = useColorModeValue('gray.200', 'gray.600');
  const accordionExpandedBg = useColorModeValue('teal.100', 'teal.600');
  const accordionExpandedColor = useColorModeValue('black', 'white');

  useEffect(() => {
    setTitle('Muslimah Center');
    setImage(logoUrl);
    setSubtitle(
      'Muslimah Center memberdayakan muslimah melalui program edukatif, sosial, dan kesehatan.'
    );
    return () => {
      setImage(siteConfig.image);
      setTitle(siteConfig.title);
      setSubtitle(siteConfig.subtitle);
    };
  }, [image, logoUrl, title, subtitle, setImage, setTitle, setSubtitle]);

  return (
    <ContentWrapper>
      <VStack spacing={6} align="start">
        <Text fontSize="md">
          Klik tautan di bawah untuk menghubungi contact person setiap sentra.
        </Text>

        <Accordion allowMultiple w="full">
          {data.map((sentra) => (
            <AccordionItem key={sentra.title}>
              <h2>
                <AccordionButton
                  py={4}
                  bg={accordionBg}
                  _hover={{ bg: accordionHoverBg }}
                  _expanded={{
                    bg: accordionExpandedBg,
                    color: accordionExpandedColor,
                  }}
                >
                  <Box flex="1" textAlign="left" fontWeight="bold">
                    {sentra.title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Text fontSize="sm">{sentra.description}</Text>
                {sentra.linkTitle && (
                  <Link href={sentra.link} isExternal>
                    <Button mt={4} w="full" colorScheme="teal">
                      Hubungi ({sentra.linkTitle})
                    </Button>
                  </Link>
                )}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </VStack>
    </ContentWrapper>
  );
};

export default MuslimahCenterPage;

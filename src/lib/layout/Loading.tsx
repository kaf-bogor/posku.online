import { Flex, Spinner, Text } from '@chakra-ui/react';

export default function Loading({
  size = 'md',
  withText = false,
}: {
  size?: string;
  withText?: boolean;
}) {
  return (
    <Flex alignSelf="center" align="center" justify="center" direction="column">
      <Spinner size={size} thickness="4px" speed="0.65s" color="Blue.500" />
      {withText && (
        <Text mt={4} fontSize="lg" color="gray.600">
          Loading...
        </Text>
      )}
    </Flex>
  );
}

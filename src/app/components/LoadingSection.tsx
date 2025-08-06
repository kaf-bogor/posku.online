import { Center, VStack, Spinner, Text } from '@chakra-ui/react';

export default function LoadingSection({
  resourceName,
}: {
  resourceName: string;
}) {
  return (
    <Center py={16}>
      <VStack spacing={4}>
        <Spinner size="xl" color="purple.500" />
        <Text color="purple.500">Memuat {resourceName}...</Text>
      </VStack>
    </Center>
  );
}

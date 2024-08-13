import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react';

export default function Error({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  return (
    <Alert status="error" variant="top-accent" maxWidth="md">
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription display="block">{error.message}</AlertDescription>
      </Box>
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </Alert>
  );
}

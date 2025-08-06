import { Button, Text } from '@chakra-ui/react';
import DOMPurify from 'dompurify';
import { useContext, useState } from 'react';

import { AppContext } from '~/lib/context/app';

export default function Summary({ summary }: Props) {
  const [isExpanded, setIsExpanded] = useState(false); // New state for toggling summary
  const { textColor } = useContext(AppContext);

  const sanitizedSummary = DOMPurify.sanitize(summary);

  return (
    <>
      <Text
        fontSize="sm"
        color={textColor}
        dangerouslySetInnerHTML={{
          __html: isExpanded
            ? sanitizedSummary
            : `${sanitizedSummary.slice(0, 150)}${sanitizedSummary.length > 150 ? '...' : ''}`,
        }}
      />

      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="link"
        colorScheme="teal"
        size="sm"
      >
        {isExpanded ? 'Read Less' : 'Read More'}
      </Button>
    </>
  );
}

interface Props {
  summary: string;
}

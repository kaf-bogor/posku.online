'use client';

import {
  Card,
  CardBody,
  Stack,
  Box,
  Heading,
  AspectRatio,
  Image,
  RadioGroup,
  VStack,
  Radio,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

import type { Question } from '~/lib/types/quiz';

interface QuestionCardProps {
  question: Question;
  currentAnswer: string;
  onAnswerChange: (value: string) => void;
}

export default function QuestionCard({
  question,
  currentAnswer,
  onAnswerChange,
}: QuestionCardProps) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="sm">
      <CardBody>
        <Stack spacing={6}>
          <Box>
            <Heading size="sm" mb={4}>
              {question.title}
            </Heading>

            {/* Media (if available) */}
            {question.media && (
              <Box mb={4}>
                {question.media.includes('youtube.com') ||
                question.media.includes('youtu.be') ? (
                  <AspectRatio ratio={16 / 9} maxW="500px">
                    <iframe
                      src={question.media.replace('watch?v=', 'embed/')}
                      title="Quiz media"
                      allowFullScreen
                    />
                  </AspectRatio>
                ) : (
                  <Image
                    src={question.media}
                    alt="Quiz question media"
                    maxW="500px"
                    borderRadius="md"
                  />
                )}
              </Box>
            )}
          </Box>

          <RadioGroup value={currentAnswer} onChange={onAnswerChange}>
            <VStack align="stretch" spacing={3}>
              {question.options.map((option, index) => (
                <Radio
                  key={`question-${question.id}-${option}`}
                  value={String.fromCharCode(65 + index)}
                  size="lg"
                >
                  <Text ml={2}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        </Stack>
      </CardBody>
    </Card>
  );
}

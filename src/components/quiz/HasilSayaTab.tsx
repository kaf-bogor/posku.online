import {
  TabPanel,
  Center,
  Spinner,
  Box,
  Text,
  VStack,
  Card,
  CardBody,
  Stack,
  HStack,
  Badge,
  Divider,
  Spacer,
  useColorModeValue,
} from '@chakra-ui/react';

interface QuestionAnswer {
  id: string;
  quizTitle: string;
  questionTitle: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  options: string[];
  submittedAt: Date;
}

interface HasilSayaTabProps {
  userQuestionAnswers: QuestionAnswer[];
  userAttemptsLoading: boolean;
}

const HasilSayaTab = ({
  userQuestionAnswers,
  userAttemptsLoading,
}: HasilSayaTabProps) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (userAttemptsLoading) {
    return (
      <TabPanel px={0}>
        <Center py={8}>
          <Spinner />
        </Center>
      </TabPanel>
    );
  }

  if (userQuestionAnswers.length === 0) {
    return (
      <TabPanel px={0}>
        <Box textAlign="center" py={8}>
          <Text color="gray.500" mb={2}>
            Anda belum menyelesaikan pertanyaan apapun
          </Text>
          <Text color="gray.400" fontSize="sm">
            Mulai mengikuti kuis untuk melihat jawaban Anda di sini
          </Text>
        </Box>
      </TabPanel>
    );
  }

  return (
    <TabPanel px={0}>
      <VStack spacing={4} align="stretch">
        {userQuestionAnswers.map((qa) => (
            <Card key={qa.id} bg={cardBg} border="1px" borderColor={borderColor} size="sm">
              <CardBody>
                <Stack spacing={3}>
                  {/* Header */}
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="bold" color="blue.600">
                        {qa.quizTitle}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {qa.submittedAt ? new Date(qa.submittedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme={qa.isCorrect ? 'green' : 'red'}
                      size="sm"
                    >
                      {qa.isCorrect ? '✓ Benar' : '✗ Salah'}
                    </Badge>
                  </HStack>

                  <Divider />

                  {/* Question */}
                  <Box>
                    <Text fontWeight="medium" mb={3}>
                      {qa.questionTitle}
                    </Text>

                    {/* Options with user's answer highlighted */}
                    <VStack spacing={2} align="stretch">
                      {qa.options.map((option, optionIndex) => {
                        const optionLetter = String.fromCharCode(65 + optionIndex);
                        const isUserAnswer = qa.userAnswer === optionLetter;
                        const isCorrectAnswer = qa.correctAnswer === optionLetter;

                        let bgColor = 'transparent';
                        let optionBorderColor = 'gray.200';
                        let textColor = 'inherit';

                        if (isCorrectAnswer) {
                          bgColor = 'green.50';
                          optionBorderColor = 'green.200';
                          textColor = 'green.700';
                        } else if (isUserAnswer && !qa.isCorrect) {
                          bgColor = 'red.50';
                          optionBorderColor = 'red.200';
                          textColor = 'red.700';
                        }

                        return (
                          <Box
                            key={`${qa.id}-option-${optionIndex}`}
                            p={3}
                            borderRadius="md"
                            border="1px"
                            borderColor={optionBorderColor}
                            bg={bgColor}
                            position="relative"
                          >
                            <HStack>
                              <Text fontWeight="medium" color={textColor}>
                                {optionLetter}.
                              </Text>
                              <Text color={textColor}>
                                {option}
                              </Text>
                              <Spacer />
                              {isUserAnswer && (
                                <Badge size="sm" colorScheme={qa.isCorrect ? 'green' : 'red'}>
                                  Jawaban Anda
                                </Badge>
                              )}
                              {isCorrectAnswer && (
                                <Badge size="sm" colorScheme="green" variant="outline">
                                  Jawaban Benar
                                </Badge>
                              )}
                            </HStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
        ))}
      </VStack>
    </TabPanel>
  );
};

export default HasilSayaTab;
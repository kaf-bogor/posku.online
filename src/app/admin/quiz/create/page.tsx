'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Card,
  CardBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  IconButton,
  Divider,
  Alert,
  AlertIcon,
  Center,
  Spinner,
  useColorModeValue,
  useToast,
  Flex,
  Badge,
  Radio,
  RadioGroup,
  Image,
  AspectRatio,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiArrowLeft,
  FiUpload,
  FiEye,
} from 'react-icons/fi';

import useAuth from '~/lib/hooks/useAuth';
import useAdminAuthorization from '~/lib/hooks/useAdminAuthorization';
import { createQuiz, generateQuestionId } from '~/lib/services/quizService';
import type { Question, QuizFormData, QuestionImport } from '~/lib/types/quiz';

const CreateQuizPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth('admin');
  const { notAllowed, adminsLoading } = useAdminAuthorization(user);

  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    level: 'Beginner',
    timeLimit: 3,
    questions: [],
  });

  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (field: keyof QuizFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: generateQuestionId(),
      title: '',
      options: ['', '', '', ''],
      answer: 'A',
      level: formData.level,
      media: '',
    };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, ...updates } : q
      ),
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleJsonImport = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: 'Empty input',
        description: 'Please paste your JSON data in the textarea.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setImporting(true);

    try {
      const importedQuestions: QuestionImport[] = JSON.parse(jsonInput);

      // Validate imported data
      if (!Array.isArray(importedQuestions)) {
        throw new Error('Invalid JSON format. Expected an array of questions.');
      }

      if (importedQuestions.length === 0) {
        throw new Error('No questions found in the JSON data.');
      }

      const validatedQuestions: Question[] = importedQuestions.map(
        (q, index) => {
          // Validate required fields
          if (!q.title || typeof q.title !== 'string' || !q.title.trim()) {
            throw new Error(
              `Question ${index + 1}: Title is required and must be a non-empty string.`
            );
          }

          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(
              `Question ${index + 1}: Must have exactly 4 options as an array.`
            );
          }

          // Validate all options are non-empty strings
          q.options.forEach((option, optionIndex) => {
            if (!option || typeof option !== 'string' || !option.trim()) {
              throw new Error(
                `Question ${index + 1}: Option ${String.fromCharCode(65 + optionIndex)} must be a non-empty string.`
              );
            }
          });

          if (!q.answer || !['A', 'B', 'C', 'D'].includes(q.answer)) {
            throw new Error(
              `Question ${index + 1}: Answer must be 'A', 'B', 'C', or 'D'.`
            );
          }

          if (!q.level || typeof q.level !== 'string' || !q.level.trim()) {
            throw new Error(
              `Question ${index + 1}: Level is required and must be a non-empty string.`
            );
          }

          // Validate media URL if provided
          if (q.media && typeof q.media !== 'string') {
            throw new Error(
              `Question ${index + 1}: Media must be a string (URL) or empty.`
            );
          }

          return {
            id: generateQuestionId(),
            title: q.title.trim(),
            options: q.options.map((opt) => opt.trim()),
            answer: q.answer,
            level: q.level.trim(),
            media: q.media?.trim() || '',
          };
        }
      );

      setFormData((prev) => ({
        ...prev,
        questions: [...prev.questions, ...validatedQuestions],
      }));

      toast({
        title: 'Questions imported successfully',
        description: `${validatedQuestions.length} questions added to the quiz.`,
        status: 'success',
        duration: 5000,
      });

      // Clear the input and hide the JSON input area
      setJsonInput('');
      setShowJsonInput(false);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description:
          error instanceof Error ? error.message : 'Invalid JSON format',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!user) return;

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Quiz title is required.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Quiz description is required.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (formData.questions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one question is required.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Validate all questions
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];

      if (!question.title.trim()) {
        toast({
          title: 'Validation Error',
          description: `Question ${i + 1} title is required.`,
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      if (question.options.some((option) => !option.trim())) {
        toast({
          title: 'Validation Error',
          description: `Question ${i + 1} must have all options filled.`,
          status: 'warning',
          duration: 3000,
        });
        return;
      }
    }

    try {
      setSaving(true);
      const quizId = await createQuiz(formData, user.uid);

      toast({
        title: 'Quiz created successfully',
        description: 'Quiz has been saved and is now available.',
        status: 'success',
        duration: 3000,
      });

      router.push('/admin/quiz');
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: 'Error creating quiz',
        description: 'Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || adminsLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center minH="400px">
          <Spinner size="xl" />
        </Center>
      </Container>
    );
  }

  if (!user || notAllowed) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Create New Quiz
            </Heading>
            <Text color="gray.600">Create engaging quizzes for your users</Text>
          </Box>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiArrowLeft />}
              onClick={() => router.push('/admin/quiz')}
              variant="outline"
            >
              Back
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleSaveQuiz}
              isLoading={saving}
              loadingText="Saving..."
              isDisabled={formData.questions.length === 0}
            >
              Save Quiz
            </Button>
          </HStack>
        </Flex>

        {/* Quiz Details */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={6}>
              <Heading size="md">Quiz Details</Heading>

              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter quiz title"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </FormControl>

              <HStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Level</FormLabel>
                  <Select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Time Limit (minutes)</FormLabel>
                  <NumberInput
                    value={formData.timeLimit}
                    onChange={(_, value) =>
                      handleInputChange('timeLimit', value || 3)
                    }
                    min={1}
                    max={60}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
            </Stack>
          </CardBody>
        </Card>

        {/* Questions Section */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={6}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Heading size="md">
                    Questions ({formData.questions.length})
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Add questions manually or import from JSON
                  </Text>
                </Box>

                <HStack spacing={3}>
                  <Button
                    leftIcon={<FiUpload />}
                    onClick={() => setShowJsonInput(!showJsonInput)}
                    variant="outline"
                    colorScheme={showJsonInput ? 'red' : 'blue'}
                  >
                    {showJsonInput ? 'Cancel Import' : 'Import from JSON'}
                  </Button>
                  <Button
                    colorScheme="green"
                    leftIcon={<FiPlus />}
                    onClick={addQuestion}
                  >
                    Add Question
                  </Button>
                </HStack>
              </Flex>

              {/* JSON Import Section */}
              {showJsonInput && (
                <Card bg="blue.50" border="1px" borderColor="blue.200">
                  <CardBody>
                    <Stack spacing={4}>
                      <Box>
                        <Text fontWeight="medium" mb={2}>
                          Paste JSON Questions Data
                        </Text>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Paste your JSON questions data below. Each question
                          must have: title, options (array of 4), answer
                          (A/B/C/D), level, and optional media URL.
                        </Text>
                      </Box>

                      <Textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder={`[
  {
    "title": "What is 2 + 2?",
    "options": ["2", "3", "4", "5"],
    "answer": "C",
    "level": "Beginner",
    "media": "https://example.com/image.jpg"
  }
]`}
                        minH="200px"
                        fontFamily="mono"
                        fontSize="sm"
                      />

                      <HStack>
                        <Button
                          colorScheme="blue"
                          onClick={handleJsonImport}
                          isLoading={importing}
                          loadingText="Validating and importing..."
                          isDisabled={!jsonInput.trim()}
                        >
                          Validate and Import Questions
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setJsonInput('');
                            setShowJsonInput(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    </Stack>
                  </CardBody>
                </Card>
              )}

              {formData.questions.length === 0 ? (
                <Box textAlign="center" py={12} bg="gray.50" borderRadius="md">
                  <Text fontSize="lg" color="gray.500" mb={4}>
                    No questions added yet
                  </Text>
                  <Text color="gray.400" mb={6}>
                    Add your first question to get started
                  </Text>
                  <Button colorScheme="green" onClick={addQuestion}>
                    Add Question
                  </Button>
                </Box>
              ) : (
                <VStack spacing={6}>
                  {formData.questions.map((question, index) => (
                    <Card
                      key={question.id}
                      w="full"
                      bg="gray.50"
                      border="1px"
                      borderColor={borderColor}
                    >
                      <CardBody>
                        <Stack spacing={4}>
                          <Flex justify="space-between" align="center">
                            <Badge colorScheme="blue">
                              Question {index + 1}
                            </Badge>
                            <HStack>
                              <Button
                                size="sm"
                                leftIcon={<FiEye />}
                                variant="outline"
                              >
                                Preview
                              </Button>
                              <IconButton
                                aria-label="Delete question"
                                icon={<FiTrash2 />}
                                onClick={() => removeQuestion(index)}
                                colorScheme="red"
                                variant="outline"
                                size="sm"
                              />
                            </HStack>
                          </Flex>

                          <FormControl isRequired>
                            <FormLabel>Question Title</FormLabel>
                            <Textarea
                              value={question.title}
                              onChange={(e) =>
                                updateQuestion(index, { title: e.target.value })
                              }
                              placeholder="Enter your question"
                              rows={2}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Media URL (Optional)</FormLabel>
                            <Input
                              value={question.media}
                              onChange={(e) =>
                                updateQuestion(index, { media: e.target.value })
                              }
                              placeholder="YouTube URL, image URL, or Google Drive link"
                            />
                            {question.media && (
                              <Box mt={2}>
                                {question.media.includes('youtube.com') ||
                                question.media.includes('youtu.be') ? (
                                  <AspectRatio ratio={16 / 9} maxW="300px">
                                    <iframe
                                      src={question.media.replace(
                                        'watch?v=',
                                        'embed/'
                                      )}
                                      title="Preview"
                                    />
                                  </AspectRatio>
                                ) : (
                                  <Image
                                    src={question.media}
                                    alt="Preview"
                                    maxW="300px"
                                    borderRadius="md"
                                  />
                                )}
                              </Box>
                            )}
                          </FormControl>

                          <VStack align="stretch" spacing={3}>
                            <FormLabel>Answer Options</FormLabel>
                            {question.options.map((option, optionIndex) => (
                              <HStack key={optionIndex}>
                                <Text fontWeight="medium" minW="20px">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </Text>
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optionIndex] = e.target.value;
                                    updateQuestion(index, {
                                      options: newOptions,
                                    });
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                />
                              </HStack>
                            ))}
                          </VStack>

                          <FormControl isRequired>
                            <FormLabel>Correct Answer</FormLabel>
                            <RadioGroup
                              value={question.answer}
                              onChange={(value) =>
                                updateQuestion(index, { answer: value })
                              }
                            >
                              <HStack spacing={6}>
                                {['A', 'B', 'C', 'D'].map((letter) => (
                                  <Radio key={letter} value={letter}>
                                    {letter}
                                  </Radio>
                                ))}
                              </HStack>
                            </RadioGroup>
                          </FormControl>
                        </Stack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </Stack>
          </CardBody>
        </Card>

        {/* JSON Import Format Info */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={4}>
              <Heading size="sm">JSON Import Format & Guidelines</Heading>
              <Text fontSize="sm" color="gray.600">
                Use this exact format when importing questions via JSON:
              </Text>

              <Box
                bg="gray.100"
                p={4}
                borderRadius="md"
                fontFamily="mono"
                fontSize="sm"
              >
                <pre>{`[
  {
    "title": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "answer": "C",
    "level": "Beginner",
    "media": "https://example.com/image.jpg"
  },
  {
    "title": "Which planet is closest to the Sun?",
    "options": ["Venus", "Mercury", "Earth", "Mars"],
    "answer": "B",
    "level": "Intermediate",
    "media": "https://www.youtube.com/watch?v=example"
  }
]`}</pre>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={2}>
                  Field Requirements:
                </Text>
                <VStack
                  align="start"
                  spacing={1}
                  fontSize="sm"
                  color="gray.600"
                >
                  <Text>
                    • <strong>title</strong>: Question text (required, non-empty
                    string)
                  </Text>
                  <Text>
                    • <strong>options</strong>: Array of exactly 4 answer
                    choices (required)
                  </Text>
                  <Text>
                    • <strong>answer</strong>: Correct answer as "A", "B", "C",
                    or "D" (required)
                  </Text>
                  <Text>
                    • <strong>level</strong>: Difficulty level (required, e.g.,
                    "Beginner", "Intermediate", "Advanced")
                  </Text>
                  <Text>
                    • <strong>media</strong>: Image URL, YouTube link, or Google
                    Drive link (optional)
                  </Text>
                </VStack>
              </Box>

              <Alert status="info" size="sm">
                <AlertIcon />
                <Text fontSize="sm">
                  The import feature validates all fields before adding
                  questions. Any errors will be shown with specific field and
                  question numbers.
                </Text>
              </Alert>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Container>
  );
};

export default CreateQuizPage;

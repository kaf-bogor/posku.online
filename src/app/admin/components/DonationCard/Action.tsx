import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Button, HStack, IconButton } from '@chakra-ui/react';

export default function Action({ path, onEdit, onDelete }: Props) {
  return (
    <HStack justify="space-between" mt={2} w="full">
      {path && (
        <Button as="a" href={path} colorScheme="teal" size="sm" w="full">
          Lihat detail
        </Button>
      )}
      <HStack spacing={2}>
        {onEdit && (
          <IconButton
            aria-label="Edit"
            icon={<EditIcon />}
            size="sm"
            onClick={onEdit}
          />
        )}
        {onDelete && (
          <IconButton
            aria-label="Delete"
            icon={<DeleteIcon />}
            size="sm"
            colorScheme="red"
            onClick={onDelete}
          />
        )}
      </HStack>
    </HStack>
  );
}

interface Props {
  path?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

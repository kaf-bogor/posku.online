'use client';

import { Box, useColorModeValue } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Merender jawaban asisten sebagai Markdown yang bersih & mudah dipindai.
 * - Tidak mengizinkan raw HTML (aman terhadap XSS dari data).
 * - Hanya mengizinkan protokol https/http/tel/mailto pada link.
 */
export default function AssistantMarkdown({ text }: { text: string }) {
  const headingColor = useColorModeValue('#0f172a', '#f1f5f9');
  const bodyColor = useColorModeValue('#1e293b', '#e2e8f0');
  const mutedColor = useColorModeValue('#64748b', '#94a3b8');
  const linkColor = useColorModeValue('#2563eb', '#60a5fa');
  const dividerColor = useColorModeValue('#e2e8f0', '#334155');

  return (
    <Box
      className="posku-markdown"
      color={bodyColor}
      fontSize="14px"
      lineHeight="1.55"
      sx={{
        '& > :first-child': { mt: 0 },
        '& > :last-child': { mb: 0 },
        '& h2': {
          fontSize: '15px',
          fontWeight: 800,
          color: headingColor,
          mt: 2,
          mb: 1.5,
        },
        '& h3': {
          fontSize: '14px',
          fontWeight: 700,
          color: headingColor,
          mt: 2.5,
          mb: 1,
        },
        '& p': { mt: 1, mb: 1, color: bodyColor },
        '& strong': { fontWeight: 700, color: headingColor },
        '& ul': { mt: 1, mb: 1, pl: 4, listStyle: 'disc' },
        '& ol': { mt: 1, mb: 1, pl: 4, listStyle: 'decimal' },
        '& li': { mt: 0.5, mb: 0.5, pl: 1 },
        '& a': {
          color: linkColor,
          textDecoration: 'underline',
          fontWeight: 600,
        },
        '& a:hover': { opacity: 0.8 },
        '& hr': {
          border: 'none',
          borderTop: '1px solid',
          borderColor: dividerColor,
          my: 2.5,
        },
        '& code': {
          bg: `${mutedColor}22`,
          px: 1,
          py: 0.5,
          borderRadius: '6px',
          fontSize: '12.5px',
        },
        '& blockquote': {
          borderLeft: '3px solid',
          borderColor: dividerColor,
          pl: 3,
          my: 1.5,
          color: mutedColor,
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => {
          try {
            const u = new URL(url, 'https://posku.online');
            return ['http:', 'https:', 'tel:', 'mailto:'].includes(u.protocol)
              ? u.href
              : '';
          } catch {
            return '';
          }
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
}

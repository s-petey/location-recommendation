import { StartClient } from '@tanstack/react-start';
/// <reference types="vinxi/types/client" />
import { hydrateRoot } from 'react-dom/client';
import { createRouter } from './router.jsx';

const router = createRouter();

// biome-ignore lint/style/noNonNullAssertion: Part of tanstack setup examples
hydrateRoot(document!, <StartClient router={router} />);

import { createContext, useContext } from 'react';
import type { Lang } from './types';

// Current UI language. Backend morphology/role labels are localised server-side,
// but confidence is a stable code, so the frontend localises confidence labels
// and warning text itself.
export const LangContext = createContext<Lang>('hu');
export const useLang = () => useContext(LangContext);

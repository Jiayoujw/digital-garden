'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Moon, Sun, TreePine, Waves, Sunset } from 'lucide-react';

export type ThemeId = 'dark' | 'light' | 'forest' | 'ocean' | 'sunset';

interface ThemeColors {
  '--color-bg-primary': string;
  '--color-bg-secondary': string;
  '--color-bg-tertiary': string;
  '--color-border': string;
  '--color-text-primary': string;
  '--color-text-secondary': string;
  '--color-text-muted': string;
  '--color-accent': string;
  '--color-accent-hover': string;
  '--color-accent-subtle': string;
  '--color-danger': string;
  '--color-success': string;
}

export const themes: Record<ThemeId, { name: string; nameZh: string; icon: ReactNode; colors: ThemeColors }> = {
  dark: {
    name: 'Dark',
    nameZh: '暗夜',
    icon: <Moon size={14} />,
    colors: {
      '--color-bg-primary': '#0f0f14',
      '--color-bg-secondary': '#16161e',
      '--color-bg-tertiary': '#1c1c26',
      '--color-border': '#2a2a3a',
      '--color-text-primary': '#e0e0e8',
      '--color-text-secondary': '#8888a0',
      '--color-text-muted': '#5a5a72',
      '--color-accent': '#6366f1',
      '--color-accent-hover': '#818cf8',
      '--color-accent-subtle': 'rgba(99, 102, 241, 0.12)',
      '--color-danger': '#ef4444',
      '--color-success': '#22c55e',
    },
  },
  light: {
    name: 'Light',
    nameZh: '明亮',
    icon: <Sun size={14} />,
    colors: {
      '--color-bg-primary': '#fafafa',
      '--color-bg-secondary': '#ffffff',
      '--color-bg-tertiary': '#f0f0f3',
      '--color-border': '#d4d4d8',
      '--color-text-primary': '#18181b',
      '--color-text-secondary': '#52525b',
      '--color-text-muted': '#a1a1aa',
      '--color-accent': '#6366f1',
      '--color-accent-hover': '#4f46e5',
      '--color-accent-subtle': 'rgba(99, 102, 241, 0.08)',
      '--color-danger': '#ef4444',
      '--color-success': '#22c55e',
    },
  },
  forest: {
    name: 'Forest',
    nameZh: '森林',
    icon: <TreePine size={14} />,
    colors: {
      '--color-bg-primary': '#0d1a0e',
      '--color-bg-secondary': '#132016',
      '--color-bg-tertiary': '#1a2e1d',
      '--color-border': '#2a402e',
      '--color-text-primary': '#d8e8d4',
      '--color-text-secondary': '#8aa884',
      '--color-text-muted': '#5a7a54',
      '--color-accent': '#4ade80',
      '--color-accent-hover': '#86efac',
      '--color-accent-subtle': 'rgba(74, 222, 128, 0.12)',
      '--color-danger': '#f87171',
      '--color-success': '#4ade80',
    },
  },
  ocean: {
    name: 'Ocean',
    nameZh: '海洋',
    icon: <Waves size={14} />,
    colors: {
      '--color-bg-primary': '#0a1628',
      '--color-bg-secondary': '#0f1f3a',
      '--color-bg-tertiary': '#162d52',
      '--color-border': '#1e3a6b',
      '--color-text-primary': '#d0e0f8',
      '--color-text-secondary': '#7a9ec8',
      '--color-text-muted': '#4a6e98',
      '--color-accent': '#38bdf8',
      '--color-accent-hover': '#7dd3fc',
      '--color-accent-subtle': 'rgba(56, 189, 248, 0.12)',
      '--color-danger': '#f87171',
      '--color-success': '#34d399',
    },
  },
  sunset: {
    name: 'Sunset',
    nameZh: '日落',
    icon: <Sunset size={14} />,
    colors: {
      '--color-bg-primary': '#1a0f0d',
      '--color-bg-secondary': '#241514',
      '--color-bg-tertiary': '#301d1a',
      '--color-border': '#452a25',
      '--color-text-primary': '#f0dcd4',
      '--color-text-secondary': '#b89488',
      '--color-text-muted': '#7a5a4e',
      '--color-accent': '#fb923c',
      '--color-accent-hover': '#fbbf77',
      '--color-accent-subtle': 'rgba(251, 146, 60, 0.14)',
      '--color-danger': '#f87171',
      '--color-success': '#a3e635',
    },
  },
};

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  cycleTheme: () => void;
  themeInfo: (typeof themes)[ThemeId];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  cycleTheme: () => {},
  themeInfo: themes.dark,
});

const STORAGE_KEY = 'garden-theme';
const themeIds: ThemeId[] = ['dark', 'light', 'forest', 'ocean', 'sunset'];

function detectTheme(): ThemeId {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
  if (stored && themeIds.includes(stored)) return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('dark');

  useEffect(() => {
    setThemeState(detectTheme());
  }, []);

  const applyTheme = useCallback((t: ThemeId) => {
    const colors = themes[t].colors;
    for (const [key, value] of Object.entries(colors)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, []);

  const setTheme = useCallback(
    (t: ThemeId) => {
      setThemeState(t);
      localStorage.setItem(STORAGE_KEY, t);
      applyTheme(t);
    },
    [applyTheme]
  );

  const cycleTheme = useCallback(() => {
    const idx = themeIds.indexOf(theme);
    const next = themeIds[(idx + 1) % themeIds.length];
    setTheme(next);
  }, [theme, setTheme]);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themeInfo: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

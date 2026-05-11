'use client';

interface GraphControlsProps {
  mode: '2d' | '3d';
  onModeChange: (mode: '2d' | '3d') => void;
}

export function GraphControls({ mode, onModeChange }: GraphControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-1">
      <button
        onClick={() => onModeChange('2d')}
        className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
          mode === '2d'
            ? 'bg-[var(--color-accent)] text-white'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        2D
      </button>
      <button
        onClick={() => onModeChange('3d')}
        className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
          mode === '3d'
            ? 'bg-[var(--color-accent)] text-white'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }`}
      >
        3D
      </button>
    </div>
  );
}

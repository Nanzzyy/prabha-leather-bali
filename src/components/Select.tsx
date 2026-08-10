'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from './Icon';

export type SelectOption = { value: string; label: string; prefix?: ReactNode };

interface Props {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export default function Select({ value, options, onChange, label, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const choose = (v: string) => { onChange(v); setOpen(false); };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setFocusIdx(Math.max(0, options.findIndex((o) => o.value === value)));
      setOpen(true);
      return;
    }
    if (event.key === 'Escape') { setOpen(false); return; }
    if (!open) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setFocusIdx((i) => Math.min(i + 1, options.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setFocusIdx((i) => Math.max(i - 1, 0)); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); const o = options[focusIdx]; if (o) choose(o.value); }
  };

  return (
    <div className={`select ${className}`} ref={rootRef} onKeyDown={onKeyDown}>
      {label && <span className="select__label">{label}</span>}
      <button type="button" className="select__trigger" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <span className="select__value">{selected?.prefix}{selected?.label}</span><Icon>expand_more</Icon>
      </button>
      {open && (
        <ul className="select__menu" role="listbox">
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button type="button" className={`select__option ${o.value === value ? 'is-selected' : ''} ${i === focusIdx ? 'is-focused' : ''}`} onClick={() => choose(o.value)} onMouseEnter={() => setFocusIdx(i)}><span className="select__value">{o.prefix}{o.label}</span></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

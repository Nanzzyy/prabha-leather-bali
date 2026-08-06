'use client';

import { useState, type ReactNode } from 'react';
import Icon from './Icon';

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`accordion ${open ? 'is-open' : ''}`}>
      <button type="button" className="accordion__summary" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        <Icon>expand_more</Icon>
      </button>
      {open && <div className="accordion__panel">{children}</div>}
    </div>
  );
}

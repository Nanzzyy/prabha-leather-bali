interface IconProps {
  children: string;
  className?: string;
}

export default function Icon({ children, className = '' }: IconProps) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>{children}</span>;
}

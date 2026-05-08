export default function Tag({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium text-primary bg-[rgba(124,111,255,0.08)] border border-[rgba(124,111,255,0.12)] tracking-wide uppercase ${className}`}>
      {children}
    </span>
  );
}

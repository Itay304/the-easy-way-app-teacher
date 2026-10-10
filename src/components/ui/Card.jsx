export default function Card({ padding = 'p-4', className = '', children, ...rest }) {
  return (
    <div className={`rounded-2xl bg-white shadow-md ${padding} ${className}`} {...rest}>
      {children}
    </div>
  );
}

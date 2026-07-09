export default function GIXContainer({ children }) {
  return (
    <div className="relative overflow-hidden">
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default function CompendioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 rounded-lg min-h-full">{children}</div>;
}

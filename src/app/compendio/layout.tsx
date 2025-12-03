export default function CompendioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-lg min-h-full">{children}</div>;
}

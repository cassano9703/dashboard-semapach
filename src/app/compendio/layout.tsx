export default function CompendioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-[#F9F8F4] p-4 rounded-lg min-h-full">{children}</div>;
}

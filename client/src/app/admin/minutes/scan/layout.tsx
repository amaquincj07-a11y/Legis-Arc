export default function DocumentScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-3 flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden sm:-m-4 md:-m-6">
      <div className="h-full min-h-0">{children}</div>
    </div>
  );
}

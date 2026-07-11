export default function DocumentScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-3 min-h-dvh sm:-m-4 md:-m-6">{children}</div>
  );
}

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-foreground/10 border-t-foreground" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/45">
            Loading admin workspace
          </p>
        </div>
      </div>
    </div>
  );
}

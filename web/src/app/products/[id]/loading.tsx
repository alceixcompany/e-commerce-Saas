export default function ProductDetailsLoading() {
  return (
    <div className="min-h-screen bg-background pt-28 text-foreground">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-foreground/5" />
        <div className="space-y-5 py-4">
          <div className="h-3 w-28 animate-pulse rounded-full bg-foreground/8" />
          <div className="h-12 w-4/5 animate-pulse rounded-full bg-foreground/8" />
          <div className="h-6 w-32 animate-pulse rounded-full bg-foreground/8" />
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full animate-pulse rounded-full bg-foreground/6" />
            <div className="h-4 w-11/12 animate-pulse rounded-full bg-foreground/6" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-foreground/6" />
          </div>
          <div className="flex gap-3 pt-6">
            <div className="h-12 w-36 animate-pulse rounded-full bg-foreground/8" />
            <div className="h-12 w-14 animate-pulse rounded-full bg-foreground/8" />
          </div>
        </div>
      </div>
    </div>
  );
}

import { BRAND_NAME } from '@/lib/constants';

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-display text-4xl font-bold text-foreground">
        {BRAND_NAME}
      </h1>
      <p className="text-lg text-muted-foreground">
        Craft unforgettable interactive surprises
      </p>
      <p className="text-sm text-muted-foreground">Coming soon</p>
    </div>
  );
}

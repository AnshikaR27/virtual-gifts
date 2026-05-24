import { SorryPuppyPreview } from './sorry-puppy-preview';
import { LoveJarPreview } from './love-jar-preview';

export default function GiftDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  if (params.slug === 'sorry-puppy') {
    return <SorryPuppyPreview />;
  }

  if (params.slug === 'love-jar') {
    return <LoveJarPreview />;
  }

  return (
    <div className="flex min-h-[80dvh] items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold">Gift: {params.slug}</h1>
        <p className="mt-2 text-muted-foreground">Gift detail page</p>
      </div>
    </div>
  );
}

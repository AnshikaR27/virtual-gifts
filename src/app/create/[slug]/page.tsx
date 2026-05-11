export default function CreateGiftPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold">
          Create: {params.slug}
        </h1>
        <p className="mt-2 text-muted-foreground">Creation flow</p>
      </div>
    </div>
  );
}

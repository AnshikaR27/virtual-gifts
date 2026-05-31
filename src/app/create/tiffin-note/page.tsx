import type { Metadata } from 'next';
import { TiffinNoteSender } from '@/gifts/tiffin-note/sender';
import { BRAND_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Tiffin Note — ${BRAND_NAME}`,
  description: 'Pack a love note into a tiffin and send it on WhatsApp.',
};

export default function CreateTiffinNotePage() {
  return (
    <div className="flex min-h-[80dvh] items-start justify-center px-4 py-8">
      <TiffinNoteSender />
    </div>
  );
}

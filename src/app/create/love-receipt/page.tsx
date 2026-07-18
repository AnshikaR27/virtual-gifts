import type { Metadata } from 'next';
import { LoveReceiptSender } from '@/gifts/love-receipt/sender';
import { BRAND_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Love Receipt — ${BRAND_NAME}`,
  description:
    'Ring up an itemized receipt of every reason you adore them and send it on WhatsApp.',
};

export default function CreateLoveReceiptPage() {
  return (
    <div className="flex min-h-[80dvh] items-start justify-center px-4 py-8">
      <LoveReceiptSender />
    </div>
  );
}

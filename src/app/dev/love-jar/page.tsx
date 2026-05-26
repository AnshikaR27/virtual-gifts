import LoveJar from '@/gifts/love-jar';
import { testMessages } from '@/gifts/love-jar/lib/test-data';

export default function DevLoveJar() {
  const gift = {
    id: 'dev-test',
    shortId: 'dev-test',
    slug: 'love-jar',
    senderName: 'Someone Who Loves You',
    recipientName: 'Anshika',
    contentJsonb: { messages: [...testMessages] },
    paid: true,
  };

  return <LoveJar gift={gift} replayBehavior="replayable" />;
}

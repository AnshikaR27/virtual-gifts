import LoveJarV2 from '@/gifts/love-jar/v2';
import { testMessages } from '@/gifts/love-jar/lib/test-data';

/**
 * Scratch route for the rebuilt Love Jar. Renders alongside the current
 * /dev/love-jar so the two can be compared side by side. Nothing else in the
 * app imports this route.
 */
export default function DevLoveJarV2() {
  const gift = {
    id: 'dev-test-v2',
    shortId: 'dev-test-v2',
    slug: 'love-jar',
    senderName: 'Someone Who Loves You',
    recipientName: 'Anshika',
    contentJsonb: { messages: [...testMessages] },
    paid: true,
  };

  return <LoveJarV2 gift={gift} replayBehavior="replayable" />;
}

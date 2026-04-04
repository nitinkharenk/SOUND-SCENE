import { getLatestFeedItems } from "@/lib/feature-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soundscene.vercel.app";

export async function GET() {
  const items = await getLatestFeedItems();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>SoundScene Weekly Editorial Feed</title>
    <link>${siteUrl}</link>
    <description>Latest soundtrack discoveries from SoundScene.</description>
    <language>en-US</language>
    ${items
      .map(
        (item) => `<item>
      <title><![CDATA[${item.title}]]></title>
      <link>${siteUrl}${item.href}</link>
      <guid>${siteUrl}${item.href}</guid>
      <description><![CDATA[${item.description}]]></description>
      <category>${item.category}</category>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
    </item>`,
      )
      .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

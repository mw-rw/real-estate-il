import { prisma } from "./prisma";

// Yad2 scraper - fetches search results via their API endpoint
export async function scrapeYad2(city: string) {
  const results: ScrapedListing[] = [];

  try {
    const url = `https://gw.yad2.co.il/feed-search-legit/realestate/rent?city=${encodeURIComponent(city)}&forceLdLoad=true`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
        Referer: "https://www.yad2.co.il/",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return results;

    const data = await res.json();
    const items = data?.data?.feed?.feed_items ?? [];

    for (const item of items) {
      if (!item.id) continue;
      results.push({
        source: "YAD2",
        externalId: String(item.id),
        url: `https://www.yad2.co.il/item/${item.id}`,
        title: item.title ?? item.row1 ?? "",
        price: parseFloat(item.price) || null,
        rooms: parseFloat(item.Rooms) || null,
        size: parseFloat(item.square_meters) || null,
        address: item.row2 ?? null,
        city: city,
        rawData: item,
      });
    }
  } catch {
    // silently fail - scraper is best-effort
  }

  return results;
}

// Madlan scraper via their search API
export async function scrapeMadlan(city: string) {
  const results: ScrapedListing[] = [];

  try {
    const url = `https://www.madlan.co.il/api2/search/listings?q=${encodeURIComponent(city)}&dealType=rent&page=1&pageSize=50`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return results;

    const data = await res.json();
    const items = data?.data?.listings ?? data?.listings ?? [];

    for (const item of items) {
      const id = item.id ?? item.listingId;
      if (!id) continue;
      results.push({
        source: "MADLAN",
        externalId: String(id),
        url: `https://www.madlan.co.il/listing/${id}`,
        title: item.title ?? item.address ?? "",
        price: item.price ?? null,
        rooms: item.rooms ?? null,
        size: item.size ?? null,
        address: item.address ?? null,
        city: city,
        rawData: item,
      });
    }
  } catch {
    // silently fail
  }

  return results;
}

export interface ScrapedListing {
  source: "YAD2" | "MADLAN";
  externalId: string;
  url: string;
  title: string;
  price: number | null;
  rooms: number | null;
  size: number | null;
  address: string | null;
  city: string;
  rawData: unknown;
}

export async function runDailyScrape() {
  // Get all distinct cities from our properties
  const cities = await prisma.property.findMany({
    where: { status: { in: ["AVAILABLE", "FOR_SALE"] } },
    select: { city: true },
    distinct: ["city"],
  });

  let totalNew = 0;
  let totalDown = 0;

  for (const { city } of cities) {
    const [yad2, madlan] = await Promise.all([scrapeYad2(city), scrapeMadlan(city)]);

    for (const listing of [...yad2, ...madlan]) {
      const existing = await prisma.scraperListing.findUnique({
        where: { source_externalId: { source: listing.source, externalId: listing.externalId } },
      });

      if (existing) {
        await prisma.scraperListing.update({
          where: { id: existing.id },
          data: { lastSeen: new Date(), isActive: true, price: listing.price ?? undefined, rawData: listing.rawData as object },
        });
      } else {
        await prisma.scraperListing.create({
          data: {
            source: listing.source,
            externalId: listing.externalId,
            url: listing.url,
            title: listing.title,
            price: listing.price ?? undefined,
            rooms: listing.rooms ?? undefined,
            size: listing.size ?? undefined,
            address: listing.address,
            city: listing.city,
            rawData: listing.rawData as object,
          },
        });
        totalNew++;
      }
    }

    // Detect listings that went down (not seen today)
    const activeListings = await prisma.scraperListing.findMany({
      where: {
        city,
        isActive: true,
        lastSeen: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    for (const gone of activeListings) {
      await prisma.scraperListing.update({ where: { id: gone.id }, data: { isActive: false } });
      await prisma.scraperAlert.create({
        data: {
          listingId: gone.id,
          alertType: "LISTING_DOWN",
          message: `מודעה ירדה: ${gone.title} - ${gone.city}`,
        },
      });
      totalDown++;
    }
  }

  return { totalNew, totalDown };
}

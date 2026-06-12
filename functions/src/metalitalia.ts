import * as cheerio from "cheerio";

const BASE_URL = "https://metalitalia.com";

export interface WpPost {
  id: number;
  date: string;
  link: string;
  title: string;
}

interface WpPostResponse {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
}

/** Decode HTML entities (e.g. `&#8217;`) that WordPress leaves in rendered titles. */
function decodeHtml(html: string): string {
  return cheerio.load(`<div>${html}</div>`)("div").text();
}

/**
 * Fetch the most recently published posts, newest first.
 */
export async function fetchRecentPosts(perPage = 20): Promise<WpPost[]> {
  const url = `${BASE_URL}/wp-json/wp/v2/posts?per_page=${perPage}&orderby=date&order=desc&_fields=id,date,link,title`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }
  const posts = (await res.json()) as WpPostResponse[];
  return posts.map((post) => ({
    id: post.id,
    date: post.date,
    link: post.link,
    title: decodeHtml(post.title.rendered),
  }));
}

export interface ScrapedBand {
  name: string;
  slug: string;
}

/**
 * Scrape the "Per nome band" archive page for the full list of band
 * profile pages, e.g. `https://metalitalia.com/band/a-perfect-circle/`.
 */
export async function scrapeBandList(): Promise<ScrapedBand[]> {
  const res = await fetch(`${BASE_URL}/band/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch band archive: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const bands = new Map<string, ScrapedBand>();
  const linkPattern = /^https?:\/\/(www\.)?metalitalia\.com\/band\/([^/]+)\/?$/;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    const name = $(el).text().trim();
    if (!href || !name) return;

    const match = href.match(linkPattern);
    if (!match) return;

    const slug = match[2];
    if (!slug || slug === "band") return;

    if (!bands.has(slug)) {
      bands.set(slug, { name, slug });
    }
  });

  return [...bands.values()];
}

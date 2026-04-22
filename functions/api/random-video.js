/**
 * Picks a random public video from @AbaoAmbience by parsing the channel /videos page.
 * GET /api/random-video?exclude=VIDEOID   — optional: avoid the same id when auto-advancing
 */
const CHANNEL_VIDEOS_URL = "https://www.youtube.com/@AbaoAmbience/videos";

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const exclude = (url.searchParams.get("exclude") || "").trim();

  const res = await fetch(CHANNEL_VIDEOS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; trains.popped.dev/1.0; +https://trains.popped.dev)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "channel_fetch_failed", status: res.status }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const html = await res.text();
  const re = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  const ids = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    ids.add(m[1]);
  }

  let list = Array.from(ids);
  if (exclude) {
    list = list.filter((id) => id !== exclude);
  }
  if (list.length === 0) {
    return new Response(JSON.stringify({ error: "no_videos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const videoId = list[Math.floor(Math.random() * list.length)];

  return new Response(JSON.stringify({ videoId }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=120",
    },
  });
}

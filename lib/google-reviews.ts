export type GoogleReview = {
  author: string;
  authorUrl: string | null;
  photo: string | null;
  rating: number;
  text: string;
  when: string;
};

export type GooglePlace = {
  rating: number | null;
  count: number | null;
  reviews: GoogleReview[];
};

type ApiReview = {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

type ApiPlace = {
  rating?: number;
  userRatingCount?: number;
  reviews?: ApiReview[];
};

export async function getGooglePlace(locale = "hr"): Promise<GooglePlace | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const id = process.env.GOOGLE_PLACE_ID;
  if (!key || !id) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=${locale}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews",
        },
        next: { revalidate: 21600, tags: ["google-reviews"] },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as ApiPlace;

    return {
      rating: typeof data.rating === "number" ? data.rating : null,
      count: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
      reviews: (data.reviews ?? [])
        .map((r) => ({
          author: r.authorAttribution?.displayName ?? "Google",
          authorUrl: r.authorAttribution?.uri ?? null,
          photo: r.authorAttribution?.photoUri ?? null,
          rating: r.rating ?? 0,
          text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
          when: r.relativePublishTimeDescription ?? "",
        }))
        .filter((r) => r.rating >= 4 && r.text.length > 0),
    };
  } catch {
    return null;
  }
}

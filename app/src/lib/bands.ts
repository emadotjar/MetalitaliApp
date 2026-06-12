import firestore, { type FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { isFirebaseSupported } from './platform';

export interface Band {
  slug: string;
  name: string;
}

const COLLECTION = 'bands';

function toBand(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): Band {
  const data = doc.data();
  return { slug: data.slug as string, name: data.name as string };
}

/** List bands alphabetically, used as the default Discover view. */
export async function listBands(limit = 50): Promise<Band[]> {
  if (!isFirebaseSupported) return [];

  const snapshot = await firestore()
    .collection(COLLECTION)
    .orderBy('nameLower')
    .limit(limit)
    .get();

  return snapshot.docs.map(toBand);
}

/** Prefix search over band names (case-insensitive). */
export async function searchBands(query: string, limit = 30): Promise<Band[]> {
  if (!isFirebaseSupported) return [];

  const prefix = query.trim().toLowerCase();
  if (!prefix) return listBands(limit);

  const snapshot = await firestore()
    .collection(COLLECTION)
    .orderBy('nameLower')
    .startAt(prefix)
    .endAt(`${prefix}`)
    .limit(limit)
    .get();

  return snapshot.docs.map(toBand);
}

/** Fetch band metadata for a known set of slugs (used by the My Bands screen). */
export async function getBandsBySlug(slugs: string[]): Promise<Band[]> {
  if (!isFirebaseSupported || slugs.length === 0) return [];

  // Firestore 'in' queries are limited to 30 values.
  const chunks: string[][] = [];
  for (let i = 0; i < slugs.length; i += 30) {
    chunks.push(slugs.slice(i, i + 30));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      firestore().collection(COLLECTION).where('slug', 'in', chunk).get(),
    ),
  );

  return results.flatMap((snapshot) => snapshot.docs.map(toBand));
}

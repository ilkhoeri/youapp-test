import { ObjectId } from 'bson';

/**
 * ⚠️ Tapi metode ini punya keterbatasan:
 * - Jika name kurang dari 12 karakter, sisanya akan dipenuhi 0x00
 * - Jika lebih dari 12 karakter, akan dipotong, riskan id ganda
 * @param name string
 * @returns ObjectId
 */
function toObjectId(name: string) {
  const buffer = Buffer.alloc(12, 0); // Buat buffer kosong 12 byte
  const encoded = Buffer.from(name).slice(0, 12); // Ambil maksimal 12 byte dari nama
  encoded.copy(buffer); // Masukkan ke dalam buffer
  return new ObjectId(buffer);
}
// const customId1 = toObjectId('_ilhamkhoeri');
// console.log('customId1', customId1.toHexString());

/**
 * ⚠️ Catatan Penting:
 * 1. Pastikan Selalu 12 Karakter
 * - Jika kurang dari 12 karakter → perlu padding.
 * - Jika lebih dari 12 karakter → akan dipotong (berpotensi duplikasi).
 * 2. Tetap Unik?
 * - Jika "_ilhamkhoeri" digunakan oleh banyak orang, maka ID ini tidak akan unik.
 * - Kalau ingin tetap unik, bisa menambahkan random byte atau timestamp ke string sebelum dikonversi.
 * @param name string
 * @returns ObjectId
 */
export function encodeToObjectId(name: string) {
  if (name.length !== 12) {
    const error = 'String harus tepat 12 karakter untuk menjadi ObjectId!';
    console.error('Error', error);
    throw new Error(error);
  }
  return new ObjectId(Buffer.from(name)); // Konversi string ke ObjectId
}

/**
 * ⚠️ Catatan Penting
 * 1. Ini hanya bisa berhasil jika awalnya memang 12 karakter string.
 * 2. Jika ObjectId berasal dari nilai random (bukan dari string 12 karakter), maka hasil decode-nya tidak akan bisa dikembalikan ke bentuk asli.
 * @param objectId ObjectId
 * @returns string
 */
export function extractStringFromObjectId(objectId: ObjectId) {
  return objectId.id.toString(); // Mengambil kembali string aslinya
}

export const customId = encodeToObjectId('_ilhamkhoeri');
export const originalStringId = extractStringFromObjectId(customId);

// console.log('ObjectId:', customId.toHexString());
// console.log('Original String:', originalStringId);

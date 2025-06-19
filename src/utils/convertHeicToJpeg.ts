import heic2any from "heic2any";

/**
 * Converts a HEIC file to a JPEG Blob using heic2any
 * @param file HEIC File object
 * @returns JPEG Blob
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
  try {
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    return converted as Blob;
  } catch (err) {
    console.error("❌ HEIC conversion failed:", err);
    throw err;
  }
}

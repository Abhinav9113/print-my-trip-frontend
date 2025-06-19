import type { Area } from "react-easy-crop";

/**
 * Load image from a URL and return an HTMLImageElement
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.setAttribute("crossOrigin", "anonymous"); // Prevent CORS issues
    img.src = url;
  });

/**
 * Crop and scale an image to the target dimensions, return both preview and blob.
 */
export async function getCroppedImg(
  imageSrc: string,
  crop: Area,
  targetWidth = 1800,
  targetHeight = 1200
): Promise<{ previewUrl: string; blob: Blob }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context is not available");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw cropped area into canvas
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Convert canvas to blob and URL
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas blob conversion failed"));
        const previewUrl = URL.createObjectURL(blob);
        resolve({ previewUrl, blob });
      },
      "image/jpeg",
      1
    );
  });
}

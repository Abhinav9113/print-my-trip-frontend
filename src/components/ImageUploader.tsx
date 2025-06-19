import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
import { getPresignedUrl, uploadFileToS3 } from "../api/s3";
import { triggerCmykConversion } from "../api/lambda";
import { convertHeicToJpeg } from "../utils/convertHeicToJpeg";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

export default function ImageUploader() {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string>("");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [pdfLink, setPdfLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageStatus, setImageStatus] = useState<string | null>(null);
  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setLoading(true);

    let file = e.target.files[0];

    if (file.name.toLowerCase().endsWith(".heic")) {
      try {
        const jpegBlob = await convertHeicToJpeg(file);
        file = new File([jpegBlob], file.name.replace(/\.heic$/i, ".jpg"), {
          type: "image/jpeg",
        });
      } catch (err) {
        alert("Failed to convert HEIC file.");
        console.log("error", err);
        setLoading(false);
        return;
      }
    }

    const url = URL.createObjectURL(file);
    setImage(url);
    setLoading(false);
  };

  const handleCropContinue = async () => {
    const { previewUrl, blob } = await getCroppedImg(
      image,
      croppedAreaPixels!,
      1800,
      1200
    );
    setCroppedImageUrl(previewUrl);
    setCroppedImageBlob(blob);
    setStep(2);
  };

  const handleSaveImage = async () => {
    if (!croppedImageBlob) return;
    setLoading(true);
    setImageStatus("Uploading...");
    try {
      const { uploadUrl, fileKey } = await getPresignedUrl(
        "temp.jpg",
        "image/jpeg"
      );
      await uploadFileToS3(uploadUrl, croppedImageBlob);
      setImageStatus("Converting to PDF...");

      const { cmykPdfUrl } = await triggerCmykConversion(fileKey);
      setPdfLink(cmykPdfUrl);
      setStep(3);
    } catch (err) {
      alert("Something went wrong while uploading.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetToStep1 = () => {
    setStep(1);
    setCroppedImageUrl(null);
    setCroppedImageBlob(null);
    setPdfLink(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setImageStatus(null);
  };

  const resetAll = () => {
    setStep(1);
    setImage("");
    setCroppedImageUrl(null);
    setCroppedImageBlob(null);
    setPdfLink(null);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    setZoom(1);
    setImageStatus(null);
    if (fileInputRef?.current) {
      (fileInputRef.current as HTMLInputElement).value = ""; // Clear file input
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-2 mx-auto py-10 space-y-4 transition-all duration-500 ease-in-out">
      {/* Stepper */}
      <div className="flex w-full justify-between max-w-xl mb-8">
        {["Add Photo", "Preview & Save", "Download PDF"].map((label, index) => {
          const isActive = step === index + 1;
          return (
            <div key={label} className="text-center flex-1">
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
                  isActive
                    ? "border-green-600 bg-green-100 text-green-600"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-2 text-sm ${
                  isActive ? "text-green-600 font-medium" : "text-gray-400"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {/* STEP 1 */}
      <div
        className={clsx("transition-all duration-300", { hidden: step !== 1 })}
      >
        <div className="w-full flex flex-col items-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
              <Loader2 className="animate-spin h-6 w-6 text-gray-700" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
            ref={fileInputRef}
          />
          {image && (
            <div className="relative w-full max-w-xl h-[400px] rounded overflow-hidden border shadow-md">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={3 / 2}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          )}

          {image && (
            <button
              onClick={handleCropContinue}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Continue
            </button>
          )}
        </div>
      </div>

      {/* STEP 2 */}
      <div
        className={clsx("transition-all duration-300", { hidden: step !== 2 })}
      >
        <div className="w-full flex flex-col items-center space-y-4 px-2">
          <h2 className="text-lg font-semibold">Preview Your Cropped Image</h2>
          {croppedImageUrl && (
            <img
              src={croppedImageUrl}
              alt="Preview"
              className="w-full h-full rounded shadow border"
            />
          )}
          <div className="flex gap-4">
            <button
              onClick={resetToStep1}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
              disabled={loading}
            >
              ← Go Back
            </button>

            <button
              onClick={handleSaveImage}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" /> {imageStatus}
                </span>
              ) : (
                "Save Image"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* STEP 3 */}
      <div
        className={clsx("transition-all duration-300", { hidden: step !== 3 })}
      >
        <div className="w-full flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold text-green-700">
            ✅ Your Postcard is Ready!
          </h2>
          {croppedImageUrl && (
            <img
              src={croppedImageUrl}
              alt="Final"
              className="w-full h-full rounded shadow border"
            />
          )}
          {pdfLink && (
            <a
              href={pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800"
            >
              📥 Download CMYK PDF
            </a>
          )}
          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
            >
              ← Go Back
            </button>
            <button
              onClick={resetAll}
              className="bg-red-100 text-red-700 px-6 py-2 rounded hover:bg-red-200"
            >
              🔁 Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/api/s3.ts
import axios from "axios";

const BASE_URL = "https://ycm6ifrnz2.execute-api.eu-north-1.amazonaws.com/prod";

export async function getPresignedUrl(filename: string, contentType: string) {
  const res = await axios.post(
    `${BASE_URL}/presign-upload`,
    {
      filename,
      contentType,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("res", res.data);

  return res.data;
}

export async function uploadFileToS3(uploadUrl: string, blob: Blob) {
  await axios.put(uploadUrl, blob, {
    headers: {
      "Content-Type": "image/jpeg",
    },
  });
}

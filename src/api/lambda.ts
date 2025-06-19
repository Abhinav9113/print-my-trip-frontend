import axios from "axios";

const BASE_URL = "https://r509p0a8le.execute-api.eu-north-1.amazonaws.com/Prod";

export async function triggerCmykConversion(
  s3Key: string
): Promise<{ cmykPdfUrl: string }> {
  const response = await axios.post(
    `${BASE_URL}/trigger-cmyk`, // make sure this matches your route
    { s3Key },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

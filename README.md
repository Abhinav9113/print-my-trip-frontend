# 📸 Image Cropper & CMYK PDF Converter

This is a React-based image processing tool that allows users to:

1. Upload and crop an image (supports `.heic` files too).
2. Preview the cropped image before uploading.
3. Upload the cropped image to an S3 bucket.
4. Convert the image to a CMYK-colored PDF using a Lambda function.
5. Download the final CMYK PDF.

---

## 🚀 Features

- 📤 Upload image (JPG, PNG, HEIC supported)
- ✂️ Crop image using a simple UI
- 🖼️ Preview before saving
- ☁️ Upload to AWS S3
- 🎨 Convert to CMYK PDF using AWS Lambda
- 📥 Download ready-to-print PDF
- 🔁 Step-by-step flow with "Go Back" and "Start Over" buttons
- 🔄 Spinner and loading indicators for better UX

---

## 📦 Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Image Cropper**: [`react-easy-crop`](https://github.com/ValeryBugakov/react-easy-crop)
- **HEIC Conversion**: [`heic2any`](https://www.npmjs.com/package/heic2any)
- **Backend**: AWS Lambda (Node.js)
- **Storage**: Amazon S3
- **PDF Generation**: `pdf-lib` + `sharp` in Lambda

---

## 🧱 Folder Structure

```
📁 src/
├── api/                  # API calls (S3 + Lambda)
├── components/
│   └── ImageUploader.tsx # Main component with stepper flow
├── utils/
│   ├── cropImage.ts      # Image cropping logic
│   └── convertHeicToJpeg.ts # HEIC to JPEG converter
```

---

## ⚙️ How It Works

### Step 1: Upload & Crop

- User selects or drops an image.
- If `.heic`, it is converted to `.jpg` using `heic2any`.
- User adjusts crop area.

### Step 2: Preview & Save

- Cropped image is previewed.
- On "Save Image", it's uploaded to S3.
- The uploaded image is passed to Lambda for conversion.

### Step 3: Download

- Lambda generates a CMYK-colored PDF from the uploaded image.
- The PDF URL is displayed.
- User can download the final file.

---

## 🧪 Development Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/image-cropper-cmyk.git
cd image-cropper-cmyk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

> ⚠️ For external device access (e.g. ngrok), make sure Vite config has `host: true`

---

## 🖼️ Screenshots

### 📱 Mobile View

<img src="/Image.webp" width="300" />

### 💻 Desktop View

<img src="/Screenshot desktop.webp" width="600" />

---

## 🛠️ AWS Lambda Functions

You’ll need **two Lambda functions**: : [`Lambda`](https://github.com/Abhinav9113/print-my-trip-backend)

### 1. `generatePresignedUploadUrl`

- Returns a presigned URL to upload to S3.
- Generates a unique folder (e.g., `/0001/`, `/0002/`) for each new upload.

### 2. `convertToCmykPdf`

- Downloads the uploaded image from S3.
- Converts it to CMYK using `sharp`.
- Embeds it in a PDF using `pdf-lib`.
- Uploads the PDF back to S3.

> Make sure both functions have appropriate IAM permissions for `s3:GetObject`, `s3:PutObject`, `s3:ListBucket`.

---

## 📄 Environment Variables

Set your environment variables via `.env` or directly in your Lambda/hosting environment:

```
VITE_API_URL=https://your-api.execute-api.region.amazonaws.com
VITE_BUCKET_NAME=your-s3-bucket-name
```

---

## 📌 Notes

- The UI automatically tracks progress and prevents uploading until preview is approved.
- State resets are supported between steps.
- Lambda must be built using the right platform binaries (e.g., `sharp` on Linux x64).

---

## ❓ Developer Q&A

### 1. How did you ensure the uploaded image matches the required aspect ratio?

We used the `react-easy-crop` component and explicitly set the `aspect` prop to `3 / 2`, which ensures the crop area maintains a fixed 1800x1200 aspect ratio. This way, regardless of the image’s original dimensions, the resulting cropped image is guaranteed to match the required ratio.

---

### 2. Describe how you structured your Lambda and frontend to stay modular.

- **Frontend** is broken into:

  - `api/`: contains logic to interact with backend services (S3 and Lambda).
  - `utils/`: holds pure functions like image cropping and HEIC conversion.
  - `components/`: isolates UI components such as the stepper-based `ImageUploader`.

- **Lambda** functions:
  - One handles **upload URL generation**, focused only on folder management and presigned URLs.
  - The second focuses solely on **image-to-CMYK PDF conversion**, keeping it isolated and reusable.

This separation ensures that concerns are well-defined, making each function/testable, deployable, and independently maintainable.

---

### 3. If this app scaled to 10,000 users/day, what would you change?

- **Optimize Lambda performance** by:
  - Increasing memory/timeout settings.
  - Moving image processing to a containerized Lambda with `provisioned concurrency`.
- **Use SQS or EventBridge** for background processing rather than synchronous Lambda calls.
- Enable **CloudFront** to serve PDFs directly with caching.
- Add **rate limiting** and **upload expiration** on S3 to avoid clutter and abuse.

---

### 4. What monitoring or fallback systems would you use in production?

- **CloudWatch Logs** and **Alarms** for Lambda error tracking.
- **X-Ray tracing** for performance profiling.
- Fallback UI messages if image conversion fails.
- **Dead Letter Queues (DLQ)** for failed Lambda executions.
- Add Slack or email alerts using SNS if failures exceed thresholds.

---

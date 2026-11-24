import "server-only"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

let client: S3Client | undefined

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} must be set to access Backblaze B2 storage.`)
  }
  return value
}

function getB2Client() {
  if (!client) {
    client = new S3Client({
      region: requiredEnv("B2_REGION"),
      endpoint: requiredEnv("B2_ENDPOINT"),
      credentials: {
        accessKeyId: requiredEnv("B2_KEY_ID"),
        secretAccessKey: requiredEnv("B2_APP_KEY"),
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })
  }
  return client
}

export function mediaUrl(key: string) {
  const baseUrl = requiredEnv("MEDIA_PUBLIC_URL").replace(/\/+$/, "")
  const encodedKey = key.split("/").map(encodeURIComponent).join("/")
  return `${baseUrl}/${encodedKey}`
}

export async function presignUpload(key: string, contentType: string) {
  const bucket = requiredEnv("B2_BUCKET")
  return getSignedUrl(
    getB2Client(),
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 3600 }
  )
}

import "server-only"

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3"
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

function getBucket(name: string) {
  return requiredEnv(name)
}

export function mediaUrl(key: string) {
  const baseUrl = requiredEnv("MEDIA_PUBLIC_URL").replace(/\/+$/, "")
  const encodedKey = key.split("/").map(encodeURIComponent).join("/")
  return `${baseUrl}/${encodedKey}`
}

export async function presignUpload(key: string, contentType: string) {
  const bucket = getBucket("B2_PUBLIC_BUCKET")
  return getSignedUrl(
    getB2Client(),
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 3600 }
  )
}

export async function presignSourceUpload(key: string, contentType: string) {
  return getSignedUrl(
    getB2Client(),
    new PutObjectCommand({
      Bucket: getBucket("B2_PRIVATE_BUCKET"),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 3600 },
  )
}

export async function createSourceMultipartUpload(key: string, contentType: string) {
  const result = await getB2Client().send(
    new CreateMultipartUploadCommand({
      Bucket: getBucket("B2_PRIVATE_BUCKET"),
      Key: key,
      ContentType: contentType,
    }),
  )
  if (!result.UploadId) throw new Error("B2 did not return a multipart upload ID.")
  return result.UploadId
}

export async function presignSourcePart(
  key: string,
  uploadId: string,
  partNumber: number,
) {
  return getSignedUrl(
    getB2Client(),
    new UploadPartCommand({
      Bucket: getBucket("B2_PRIVATE_BUCKET"),
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    }),
    { expiresIn: 3600 },
  )
}

export async function completeSourceMultipartUpload(
  key: string,
  uploadId: string,
  parts: Array<{ PartNumber: number; ETag: string }>,
) {
  await getB2Client().send(
    new CompleteMultipartUploadCommand({
      Bucket: getBucket("B2_PRIVATE_BUCKET"),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    }),
  )
}

export async function getSourceObjectSize(key: string) {
  const result = await getB2Client().send(
    new HeadObjectCommand({ Bucket: getBucket("B2_PRIVATE_BUCKET"), Key: key }),
  )
  return result.ContentLength
}

export async function abortSourceMultipartUpload(key: string, uploadId: string) {
  await getB2Client().send(
    new AbortMultipartUploadCommand({
      Bucket: getBucket("B2_PRIVATE_BUCKET"),
      Key: key,
      UploadId: uploadId,
    }),
  )
}

export async function listPublicKeys(prefix: string) {
  const keys: string[] = []
  let continuationToken: string | undefined
  do {
    const result = await getB2Client().send(
      new ListObjectsV2Command({
        Bucket: getBucket("B2_PUBLIC_BUCKET"),
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    )
    keys.push(...(result.Contents ?? []).flatMap((item) => item.Key ? [item.Key] : []))
    continuationToken = result.NextContinuationToken
  } while (continuationToken)
  return keys
}

export async function deleteStorageObjects(
  bucketName: "B2_PRIVATE_BUCKET" | "B2_PUBLIC_BUCKET",
  keys: string[],
) {
  if (!keys.length) return []
  const bucket = getBucket(bucketName)
  const failures: string[] = []
  for (let offset = 0; offset < keys.length; offset += 1000) {
    const batch = keys.slice(offset, offset + 1000)
    const result = await getB2Client().send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
      }),
    )
    failures.push(...(result.Errors ?? []).flatMap((error) => error.Key ? [error.Key] : []))
  }
  return failures
}

import { IS3DAO } from "../IS3DAO";
import s3Client from "../util/S3Client";
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandInput, ObjectCannedACL, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = "fall2025-cs340-tweeter";
const REGION = "us-west-2";

export class DynamoDBS3DAO implements IS3DAO {

    async getFile(fileName: string): Promise<Uint8Array | null> {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
        });
        try {
            const response = await s3Client.send(command);
            if (!response.Body) {
                return null;
            }
            return await response.Body.transformToByteArray();
        } catch (error: any) {
            if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
                return null;
            }
            throw Error("s3 get file failed with: " + error);
        }
    }


    async putImage(
        fileName: string,
        imageStringBase64Encoded: string
      ): Promise<string> {
        let decodedImageBuffer: Buffer = Buffer.from(
          imageStringBase64Encoded,
          "base64"
        );
        const s3Params = {
          Bucket: BUCKET_NAME,
          Key: "image/" + fileName,
          Body: decodedImageBuffer,
          ContentType: "image/png",
          ACL: ObjectCannedACL.public_read,
        };
        const c = new PutObjectCommand(s3Params);
        const client = new S3Client({ region: REGION });
        try {
          await client.send(c);
          return (
          `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/image/${fileName}`
          );
        } catch (error) {
          throw Error("s3 put image failed with: " + error);
        }
      }
}


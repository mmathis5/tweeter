export interface IS3DAO {

  getFile(fileName: string): Promise<Uint8Array | null>;

  putImage(fileName: string, imageStringBase64Encoded: string): Promise<string>;
}

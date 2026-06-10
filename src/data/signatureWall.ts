// src/data/signatureWall.ts

export interface SignatureEntry {
  _id?: string;
  name: string;
  message: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

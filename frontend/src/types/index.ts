export type Entity = {
  kind: string;
  value: string;
  confidence: number;
};

export type UploadResult = {
  file_id: string;
  filename: string;
  sha256: string;
  stored_at: string;
};

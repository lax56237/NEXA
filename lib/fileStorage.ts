import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Base directory for file uploads
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directories exist
function ensureDirectoryExists(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Initialize storage directories
export function initializeStorage(): void {
  ensureDirectoryExists(path.join(UPLOAD_DIR, 'videos'));
  ensureDirectoryExists(path.join(UPLOAD_DIR, 'thumbnails'));
}

// Save base64 data to file
export async function saveBase64File(
  base64Data: string,
  fileType: string,
  directory: string
): Promise<string> {
  // Extract the actual base64 data (remove data URL prefix)
  const base64Content = base64Data.split(';base64,').pop() || '';
  if (!base64Content) {
    throw new Error('Invalid base64 data');
  }

  // Create a unique filename
  const fileExtension = fileType.split('/').pop() || 'mp4';
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = path.join(directory, fileName);
  
  // Ensure the directory exists
  ensureDirectoryExists(directory);

  // Write the file
  await fs.promises.writeFile(filePath, base64Content, 'base64');
  
  // Return the relative path for storage in the database
  return filePath.replace(process.cwd(), '').replace(/\\/g, '/').replace(/^\//, '');
}

// Save video file
export async function saveVideo(base64Video: string, mimeType: string): Promise<string> {
  const videoDir = path.join(UPLOAD_DIR, 'videos');
  return saveBase64File(base64Video, mimeType, videoDir);
}

// Save thumbnail file
export async function saveThumbnail(base64Thumbnail: string, format = 'image/jpeg'): Promise<string> {
  const thumbnailDir = path.join(UPLOAD_DIR, 'thumbnails');
  return saveBase64File(base64Thumbnail, format, thumbnailDir);
}

// Get public URL for a file
export function getPublicUrl(filePath: string): string {
  return `/${filePath}`;
}
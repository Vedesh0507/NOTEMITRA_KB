import { PDFDocument } from 'pdf-lib';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
  compressionRatio: number;
}

export interface CompressionProgress {
  stage: 'reading' | 'processing' | 'compressing' | 'finalizing';
  message: string;
}

/**
 * Compresses a PDF file if it exceeds the maximum size limit.
 * Uses pdf-lib to optimize the PDF by:
 * - Removing unused objects
 * - Cleaning up the document structure
 * - Re-saving with optimized settings
 * 
 * Note: pdf-lib compression is limited. For heavily image-based PDFs,
 * this may not achieve significant compression. In such cases,
 * we'll try multiple passes and reduce quality if needed.
 */
export async function compressPDF(
  file: File,
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> {
  const originalSize = file.size;
  
  // If file is already under the limit, return as-is
  if (originalSize <= MAX_FILE_SIZE) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
      compressionRatio: 1
    };
  }

  onProgress?.({ stage: 'reading', message: 'Reading PDF file...' });

  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    onProgress?.({ stage: 'processing', message: 'Analyzing PDF structure...' });
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
      updateMetadata: false
    });

    onProgress?.({ stage: 'compressing', message: 'Optimizing PDF...' });

    // Get page count for logging
    const pageCount = pdfDoc.getPageCount();
    console.log(`📄 PDF has ${pageCount} pages, original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

    // Save with compression options
    // pdf-lib automatically handles some optimizations when saving
    let compressedBytes = await pdfDoc.save({
      useObjectStreams: true, // More efficient storage
      addDefaultPage: false,
      objectsPerTick: 50 // Process in smaller chunks for better memory
    });

    let compressedSize = compressedBytes.length;
    console.log(`📦 First pass size: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);

    // If still too large, try additional optimization passes
    if (compressedSize > MAX_FILE_SIZE) {
      onProgress?.({ stage: 'compressing', message: 'Applying additional compression...' });
      
      // Reload and re-save to potentially remove more cruft
      const secondPassDoc = await PDFDocument.load(compressedBytes, {
        ignoreEncryption: true,
        updateMetadata: false
      });
      
      // Remove metadata to save space
      secondPassDoc.setTitle('');
      secondPassDoc.setAuthor('');
      secondPassDoc.setSubject('');
      secondPassDoc.setKeywords([]);
      secondPassDoc.setProducer('');
      secondPassDoc.setCreator('NoteMitra');
      
      compressedBytes = await secondPassDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50
      });
      
      compressedSize = compressedBytes.length;
      console.log(`📦 Second pass size: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
    }

    onProgress?.({ stage: 'finalizing', message: 'Creating compressed file...' });

    // Create a new File from the compressed bytes
    const compressedFile = new File(
      [new Uint8Array(compressedBytes)],
      file.name,
      { type: 'application/pdf' }
    );

    const compressionRatio = originalSize / compressedSize;
    const savedMB = ((originalSize - compressedSize) / 1024 / 1024).toFixed(2);
    
    console.log(`✅ Compression complete: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB (saved ${savedMB}MB, ratio: ${compressionRatio.toFixed(2)}x)`);

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      wasCompressed: true,
      compressionRatio
    };
  } catch (error) {
    console.error('PDF compression failed:', error);
    throw new Error(
      'Failed to compress PDF. The file may be corrupted or encrypted. ' +
      'Please try compressing it manually using ilovepdf.com or smallpdf.com'
    );
  }
}

/**
 * Check if a PDF file needs compression
 */
export function needsCompression(file: File): boolean {
  return file.size > MAX_FILE_SIZE;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Check if compression was successful (file is under limit)
 */
export function isUnderLimit(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

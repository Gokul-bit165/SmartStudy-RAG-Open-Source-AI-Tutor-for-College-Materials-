// frontend/src/components/FileUpload.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../api/api';
import { Toaster, toast } from 'sonner';
import { UploadCloud, Loader2 } from 'lucide-react';

// The 'userId' prop is removed; use 'onUploadSuccess' instead
const FileUpload = ({ onUploadSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    toast.loading(`Uploading ${file.name}...`);
    try {
      const response = await uploadFile(file);
      toast.success(response.data.message || `${file.name} uploaded successfully!`);
      if (onUploadSuccess) {
        onUploadSuccess(file.name);
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.response?.data?.detail || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">Upload Your Materials</h2>
        <div
          {...getRootProps()}
          className={`cursor-pointer p-8 text-center rounded-md border-2 border-dashed transition-colors ${
            isDragActive ? 'bg-gray-700 border-blue-400' : 'bg-gray-800 border-gray-600'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            {isLoading ? (
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
            ) : (
              <UploadCloud className="h-12 w-12 text-gray-500" />
            )}
            <p className="mt-4 text-gray-400">
              {isDragActive ? 'Drop the PDF here...' : 'Drag & drop a PDF here, or click'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Single PDF file only</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FileUpload;
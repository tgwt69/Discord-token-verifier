
import { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    onFileUpload(text);
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <Upload className="mr-2 h-4 w-4" />
      Upload Tokens File
      <input
        id="fileInput"
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleFileChange}
      />
    </Button>
  );
}

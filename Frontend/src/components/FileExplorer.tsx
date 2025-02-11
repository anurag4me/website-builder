import React from 'react';
import { File, Folder } from 'lucide-react';
import type { File as FileType } from '../types';

interface FileExplorerProps {
  files: FileType[];
  onFileSelect: (file: FileType) => void;
}

const FileExplorerItem: React.FC<{ file: FileType; depth?: number; onSelect: (file: FileType) => void }> = ({
  file,
  depth = 0,
  onSelect
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const paddingLeft = `${depth * 1.5}rem`;

  const handleClick = () => {
    if (file.type === 'folder') {
      setIsOpen(!isOpen);
    }
    onSelect(file);
  };

  return (
    <div>
      <div
        className="flex items-center p-2 hover:bg-gray-700 cursor-pointer"
        style={{ paddingLeft }}
        onClick={handleClick}
      >
        {file.type === 'folder' ? (
          <Folder className="w-4 h-4 mr-2 text-indigo-400" />
        ) : (
          <File className="w-4 h-4 mr-2 text-gray-400" />
        )}
        <span className="text-sm text-gray-300">{file.name}</span>
      </div>
      {isOpen && file.children?.map((child, index) => (
        <FileExplorerItem key={index} file={child} depth={depth + 1} onSelect={onSelect} />
      ))}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100">File Explorer</h2>
      </div>
      <div className="p-2">
        {files.map((file, index) => (
          <FileExplorerItem key={index} file={file} onSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
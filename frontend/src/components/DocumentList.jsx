// frontend/src/components/DocumentList.jsx
import React, { useState, useEffect } from 'react';
import { getDocuments, deleteDocument } from '../api/api';
import { FileText, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// 'userId' prop removed, only 'onUploadSuccess' is accepted
const DocumentList = ({ onUploadSuccess }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [onUploadSuccess]);

  const handleDelete = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;
    setDeleting(filename);
    try {
      await deleteDocument(filename);
      toast.success(`${filename} deleted successfully.`);
      const docElement = document.getElementById(`doc-${filename}`);
      if (docElement) {
        docElement.classList.add('opacity-0');
        setTimeout(() => {
          setDocuments(docs => docs.filter(doc => doc !== filename));
          setDeleting(null);
        }, 300);
      }
    } catch (error) {
      toast.error(`Failed to delete ${filename}.`);
      setDeleting(null);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 h-full">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">Your Documents</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <ul className="space-y-2">
          {documents.length > 0 ? (
            documents.map(doc => (
              <li
                key={doc}
                id={`doc-${doc}`}
                className="flex items-center justify-between bg-gray-700 p-2 rounded-md transition-opacity duration-300"
              >
                <div className="flex items-center truncate">
                  <FileText className="h-5 w-5 mr-2 text-blue-400 flex-shrink-0" />
                  <span className="truncate text-gray-300">{doc}</span>
                </div>
                <button
                  onClick={() => handleDelete(doc)}
                  disabled={deleting === doc}
                  className="p-1 text-gray-400 hover:text-red-500 disabled:text-gray-600"
                >
                  {deleting === doc ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                </button>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-4">No documents uploaded yet.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default DocumentList;

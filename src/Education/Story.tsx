import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth/authProvider";
import Navigation from "../Navigation/Navigation";
import { Play, Music } from "lucide-react";
import { Models } from "appwrite";
import { useDataCache } from "../contexts/auth/DataCacheProvider";
interface UploadedFile {
  $id: string;
  name: string;
  localPath: string;
  type: string;
}

interface FileDocument extends Models.Document {
  name: string;
  localPath: string;
  type: string;
}

interface Grade {
  id: string;
  label: string;
}

const Story = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>("Video");
  const [, setIsPlaying] = useState(false);
  const [, setIsLoading] = useState(false);

  const { databases } = useAuth();
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const FILES_COLLECTION_ID = "6757aef2001ea2c6930a";
  const { getCachedData, setCachedData, isDataCached } = useDataCache();
  const CACHE_KEY = `story-files-${selectedGrade}`;
  const CACHE_DURATION = 5 * 60 * 1000; // Cache for 5 minutes
  const grades: Grade[] = [
    { id: "Video", label: "Video" },
    { id: "Mp3", label: "Kể chuyện" },
  ];

  useEffect(() => {
    const fetchFiles = async () => {
      // Check if data is already cached
      if (isDataCached(CACHE_KEY)) {
        const cachedFiles = getCachedData(CACHE_KEY);
        setUploadedFiles(cachedFiles);
        return;
      }

      setIsLoading(true);
      try {
        const response = await databases.listDocuments<FileDocument>(
          DATABASE_ID,
          FILES_COLLECTION_ID
        );

        const files = response.documents.map((doc) => ({
          $id: doc.$id,
          name: doc.name,
          localPath: doc.localPath,
          type: doc.type,
        }));

        const filteredFiles = files.filter((file) => {
          const fileName = file.name.toLowerCase();
          if (selectedGrade === "Video") {
            return fileName.endsWith(".mp4");
          } else if (selectedGrade === "Mp3") {
            return (
              fileName.endsWith(".mp3") &&
              (fileName.includes("ke chuyen") ||
                fileName.includes("kể chuyện") ||
                fileName.includes("ke_chuyen"))
            );
          }
          return false;
        });

        // Cache the filtered files
        setCachedData(CACHE_KEY, filteredFiles, CACHE_DURATION);
        setUploadedFiles(filteredFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [selectedGrade, databases]);

  const handleFileClick = (file: UploadedFile) => {
    setSelectedVideo(file.localPath);
    setSelectedFile(file);
    setIsPlaying(true);
  };

  const renderMediaPlayer = () => {
    if (!selectedVideo) return null;

    return (
      <div className="space-y-4">
        {selectedGrade === "Video" ? (
          <video
            key={selectedVideo}
            src={`http://localhost:3000/${selectedVideo}`}
            className="w-full rounded-lg"
            controls
            autoPlay
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <audio
            key={selectedVideo}
            src={`http://localhost:3000/${selectedVideo}`}
            className="w-full"
            controls
            autoPlay
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
        {selectedFile && (
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            {selectedFile.name}
          </h2>
        )}
      </div>
    );
  };

  const renderFileGrid = () => {
    return uploadedFiles.map((file) => (
      <div
        key={file.$id}
        className="bg-white rounded-lg shadow overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
        onClick={() => handleFileClick(file)}
      >
        <div className="aspect-w-16 aspect-h-9 relative group">
          {selectedGrade === "Video" ? (
            <>
              <video
                src={`http://localhost:3000/${file.localPath}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <Play className="w-12 h-12 text-white opacity-70 group-hover:opacity-100" />
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Music className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900">{file.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {selectedGrade === "Mp3" ? "Kể chuyện" : "Video"}
          </p>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
            <div className="flex gap-2">
              {grades.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGrade(grade.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGrade === grade.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            {uploadedFiles.length}{" "}
            {selectedGrade === "Mp3" ? "kể chuyện" : "videos"} available
          </p>
        </div>

        {selectedVideo && (
          <div className="mb-8 bg-white p-4 rounded-lg shadow">
            <div className="relative">{renderMediaPlayer()}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderFileGrid()}
        </div>
      </main>
    </div>
  );
};

export default Story;

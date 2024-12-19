import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/auth/authProvider";
import { Query, Models } from "appwrite";

interface AudioFile extends Models.Document {
  name: string;
  bucketId: string;
  fileId: string;
  description?: string;
}

const PronunciationLesson = () => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { storage, databases } = useAuth();

  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const FILES_COLLECTION_ID = "6757aef2001ea2c6930a";

  useEffect(() => {
    fetchAudioFiles();
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, []);

  const fetchAudioFiles = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments<AudioFile>(
        DATABASE_ID,
        FILES_COLLECTION_ID,
        [Query.equal("contentType", ["reading"]), Query.orderDesc("$createdAt")]
      );

      setAudioFiles(response.documents);
    } catch (error) {
      console.error("Error fetching audio files:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileName = (name: string) => {
    return name
      .replace(/\.[^/.]+$/, "")
      .replace(/\[hanhtrangso\.nxbgd\.vn\]\s*/g, "")
      .replace(/_HTS$/g, "")
      .replace(/_/g, " ")
      .trim();
  };

  const handlePlay = async (file: AudioFile) => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setPlayingId(null);
      }

      setPlayingId(file.$id);
      const fileUrl = storage.getFileView(file.bucketId, file.fileId);
      const audio = new Audio(fileUrl);

      audio.onended = () => {
        setPlayingId(null);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setPlayingId(null);
      setCurrentAudio(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Cùng học phát âm tiếng Việt nào!
        </h1>
        <p className="text-gray-600 mb-8">
          Tập nghe và học phát âm các âm trong tiếng Việt
        </p>
      </div>

      <div>
        <div className="grid grid-cols-3 gap-4">
          {audioFiles.map((file) => (
            <button
              key={file.$id}
              onClick={() => handlePlay(file)}
              className={`bg-white p-6 rounded-xl border hover:border-blue-300 transition-all flex flex-col items-center gap-2 
                ${
                  playingId === file.$id
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200"
                }`}
            >
              <span className="text-xl font-medium">
                {formatFileName(file.name).split(" ").pop() || ""}
              </span>

              <div
                className={`w-24 h-1.5 mt-2 rounded-full ${
                  playingId === file.$id ? "bg-blue-200" : "bg-gray-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PronunciationLesson;

import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Code2, Eye } from "lucide-react";
import StepsList from "../components/StepsList";
import FileExplorer from "../components/FileExplorer";
import CodeEditor from "../components/Editor";
import PreviewFrame from "../components/PreviewFrame";
import { Step, FileItem, StepType } from "../types";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { parseXml } from "../steps";
import { useWebContainer } from "../hooks/useWebContainer";
import { Loader } from "../components/Loader";

export default function Builder() {
  const location = useLocation();
  const prompt = location.state?.prompt;
  const webcontainer = useWebContainer();

  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Example data - in a real app, this would come from your backend
  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles]; // {}
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              /// in a folder
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }
    console.log(files);
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim(),
    });
    setTemplateSet(true);

    const { prompts, uiPrompts } = response.data;

    setSteps(
      parseXml(uiPrompts[0]).map((x: Step) => ({ ...x, status: "pending" }))
    );

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      })),
    });
    setLoading(false);

    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);

    setLlmMessages([...prompts, prompt].map((content) => ({
      role: "user",
      content,
    })));

    setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
  }

  useEffect(() => {
    init();
  }, []);


  if (!prompt) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-100">
            Website Builder
          </h1>
          <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <div className="max-h-[70vh]">
            <StepsList steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
            <div>
              <div className="flex">
                <br />
                {(loading || !templateSet) && <Loader />}
                {!(loading || !templateSet) && <div className='flex'>
                <textarea className="p-2 w-full" value={userPrompt} onChange={e=>setPrompt(e.target.value)}></textarea>
                <button className="bg-purple-400 px-4" onClick={async() => {
                  const newMessage = {
                    role: "user" as "user",
                    content: userPrompt,
                  };

                  setLoading(true);
                  const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                    messages: [...llmMessages, newMessage]
                  });
                  setLoading(false);

                  setLlmMessages(x => [...x, newMessage])
                  setLlmMessages(x => [...x, {
                    role: "assistant",
                    content: stepsResponse.data.response,
                  }])

                  setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                    ...x,
                    status: "pending" as "pending"
                  }))]);
                }}>Send</button>
                </div>}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  activeTab === "code"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Code2 className="w-4 h-4 mr-2" />
                Code
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  activeTab === "preview"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>
            <div className="grid grid-cols-[250px_1fr] gap-4 h-[calc(100vh-16rem)]">
              <FileExplorer files={files} onFileSelect={setSelectedFile} />
              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
              {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : webcontainer ? (
                <PreviewFrame webContainer={webcontainer} files={files} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Initializing preview environment...</p>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

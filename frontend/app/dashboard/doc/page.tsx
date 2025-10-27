"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/ui/Toast";

const DOCUMENT_STORAGE_KEY = "document_content";
const DEFAULT_CONTENT = "This is a collaborative document...\n\nStart editing here!";

export default function DocumentPage() {
    const { role } = useAuth();
    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [showToast, setShowToast] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const isViewer = role === "Viewer";

    // Load saved content on mount
    useEffect(() => {
        const savedContent = localStorage.getItem(DOCUMENT_STORAGE_KEY);
        if (savedContent) {
            setContent(savedContent);
        }
    }, []);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isViewer) {
            setShowToast(true);
            return;
        }
        setContent(e.target.value);
    };

    const handleSave = () => {
        if (isViewer) {
            setShowToast(true);
            return;
        }
        
        // Save to localStorage
        localStorage.setItem(DOCUMENT_STORAGE_KEY, content);
        
        // Show success message
        setSaveMessage("Document saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
    };

    const handleTextareaClick = () => {
        if (isViewer) {
            setShowToast(true);
        }
    };

    return (
        <div className="flex flex-col h-full p-6">
            {showToast && (
                <Toast
                    message="You don't have permission to edit this document."
                    type="warning"
                    onClose={() => setShowToast(false)}
                />
            )}

            {saveMessage && (
                <Toast
                    message={saveMessage}
                    type="info"
                    onClose={() => setSaveMessage("")}
                    duration={3000}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Document Editor</h1>
                <button
                    onClick={handleSave}
                    className={`px-4 py-2 rounded transition-colors ${
                        isViewer 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                    title={isViewer ? "Viewers cannot save documents" : "Save document"}
                >
                    Save Document
                </button>
            </div>

            {isViewer && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    <strong>Read-only mode:</strong> You are viewing this document as a Viewer. Editing is disabled.
                </div>
            )}

            <div className="flex-1 flex flex-col border border-gray-300 rounded">
                <div className="bg-gray-100 p-2 border-b border-gray-300 flex gap-2">
                    <button 
                        className={`px-3 py-1 bg-white border border-gray-300 rounded ${
                            isViewer 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                            if (isViewer) {
                                setShowToast(true);
                            }
                        }}
                    >
                        <strong>B</strong>
                    </button>
                    <button 
                        className={`px-3 py-1 bg-white border border-gray-300 rounded ${
                            isViewer 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                            if (isViewer) {
                                setShowToast(true);
                            }
                        }}
                    >
                        <em>I</em>
                    </button>
                    <button 
                        className={`px-3 py-1 bg-white border border-gray-300 rounded ${
                            isViewer 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                            if (isViewer) {
                                setShowToast(true);
                            }
                        }}
                    >
                        <u>U</u>
                    </button>
                </div>
                
                <textarea
                    value={content}
                    onChange={handleContentChange}
                    onClick={handleTextareaClick}
                    onFocus={handleTextareaClick}
                    readOnly={isViewer}
                    className={`flex-1 p-4 resize-none focus:outline-none ${
                        isViewer ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''
                    }`}
                    placeholder="Start typing..."
                />
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Your role:</strong> {role}</p>
                <p><strong>Permissions:</strong> {isViewer ? "Read-only" : "Can edit and save"}</p>
            </div>
        </div>
    );
}

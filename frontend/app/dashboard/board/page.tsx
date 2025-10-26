"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/ui/Toast";

interface Task {
    id: number;
    title: string;
    status: "todo" | "inProgress" | "done";
}

export default function TaskBoardPage() {
    const { role } = useAuth();
    const [showToast, setShowToast] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, title: "Design login page", status: "done" },
        { id: 2, title: "Implement authentication", status: "inProgress" },
        { id: 3, title: "Add role-based access", status: "todo" },
    ]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    
    const isViewer = role === "Viewer";

    const handleAddTask = () => {
        if (isViewer) {
            setShowToast(true);
            return;
        }
        
        if (newTaskTitle.trim()) {
            const newTask: Task = {
                id: tasks.length + 1,
                title: newTaskTitle,
                status: "todo",
            };
            setTasks([...tasks, newTask]);
            setNewTaskTitle("");
        }
    };

    const handleMoveTask = (taskId: number, newStatus: Task["status"]) => {
        if (isViewer) {
            setShowToast(true);
            return;
        }
        
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
    };

    const getTasksByStatus = (status: Task["status"]) => {
        return tasks.filter(task => task.status === status);
    };

    const renderColumn = (status: Task["status"], title: string) => (
        <div className="flex-1 bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4">{title}</h3>
            <div className="space-y-2">
                {getTasksByStatus(status).map(task => (
                    <div
                        key={task.id}
                        className="bg-white p-3 rounded shadow border border-gray-200"
                    >
                        <p className="mb-2">{task.title}</p>
                        <div className="flex gap-2">
                            {status !== "todo" && (
                                <button
                                    onClick={() => handleMoveTask(task.id, status === "inProgress" ? "todo" : "inProgress")}
                                    className={`text-xs px-2 py-1 bg-gray-200 rounded ${
                                        isViewer 
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : 'hover:bg-gray-300'
                                    }`}
                                >
                                    ← Move Left
                                </button>
                            )}
                            {status !== "done" && (
                                <button
                                    onClick={() => handleMoveTask(task.id, status === "todo" ? "inProgress" : "done")}
                                    className={`text-xs px-2 py-1 bg-blue-200 rounded ${
                                        isViewer 
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : 'hover:bg-blue-300'
                                    }`}
                                >
                                    Move Right →
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full p-6">
            {showToast && (
                <Toast
                    message="You don't have permission to modify tasks."
                    type="warning"
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Task Board</h1>
                
                {isViewer && (
                    <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                        <strong>Read-only mode:</strong> You are viewing this board as a Viewer. You cannot add or move tasks.
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => {
                            if (isViewer) {
                                setShowToast(true);
                                return;
                            }
                            setNewTaskTitle(e.target.value);
                        }}
                        onClick={() => isViewer && setShowToast(true)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                        placeholder="New task title..."
                        readOnly={isViewer}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isViewer ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                    />
                    <button
                        onClick={handleAddTask}
                        className={`px-4 py-2 rounded transition-colors text-white ${
                            isViewer 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        Add Task
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {renderColumn("todo", "To Do")}
                {renderColumn("inProgress", "In Progress")}
                {renderColumn("done", "Done")}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Your role:</strong> {role}</p>
                <p><strong>Permissions:</strong> {isViewer ? "Read-only (cannot add/move tasks)" : "Can add and move tasks"}</p>
            </div>
        </div>
    );
}

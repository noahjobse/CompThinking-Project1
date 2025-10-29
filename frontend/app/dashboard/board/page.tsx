"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/ui/Toast";
import { API_BASE } from "@/lib/api";

interface Task {
    id: number;
    title: string;
    assignedTo: string;
    status: string;
}

export default function TaskBoardPage() {
    const { user, role } = useAuth();
    const [showToast, setShowToast] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const isViewer = role === "Viewer";

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/tasks`);
            const json = await res.json();
            if (res.ok && json.status === "success") {
                setTasks(json.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async () => {
        if (isViewer || !user) {
            setShowToast(true);
            return;
        }
        if (newTaskTitle.trim()) {
            try {
                const res = await fetch(`${API_BASE}/api/tasks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: newTaskTitle,
                        assignedTo: user.username,
                        status: "Pending"
                    }),
                });
                const json = await res.json();
                if (res.ok && json.status === "success") {
                    setTasks([...tasks, json.data]);
                    setNewTaskTitle("");
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleMoveTask = async (task: Task, newStatus: string) => {
        if (isViewer || !user) {
            setShowToast(true);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: task.title,
                    assignedTo: user.username,
                    status: newStatus
                }),
            });
            const json = await res.json();
            if (res.ok && json.status === "success") {
                setTasks(tasks.map(t => (t.id === task.id ? json.data : t)));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

    const renderColumn = (status: string, title: string) => (
        <div className="flex-1 bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4">{title}</h3>
            <div className="space-y-2">
                {getTasksByStatus(status).map(task => (
                    <div key={task.id} className="bg-white p-3 rounded shadow border border-gray-200">
                        <p className="mb-2">{task.title}</p>
                        <div className="flex gap-2">
                            {status !== "Pending" && (
                                <button
                                    onClick={() =>
                                        handleMoveTask(task, status === "Done" ? "In Progress" : "Pending")
                                    }
                                    className={`text-xs px-2 py-1 bg-gray-200 rounded ${
                                        isViewer
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-gray-300"
                                    }`}
                                >
                                    ← Move Left
                                </button>
                            )}
                            {status !== "Done" && (
                                <button
                                    onClick={() =>
                                        handleMoveTask(task, status === "Pending" ? "In Progress" : "Done")
                                    }
                                    className={`text-xs px-2 py-1 bg-blue-200 rounded ${
                                        isViewer
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-blue-300"
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600">Loading tasks...</p>
            </div>
        );
    }

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
                            isViewer ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                    />
                    <button
                        onClick={handleAddTask}
                        className={`px-4 py-2 rounded transition-colors text-white ${
                            isViewer
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        Add Task
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {renderColumn("Pending", "Pending")}
                {renderColumn("In Progress", "In Progress")}
                {renderColumn("Done", "Done")}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Your role:</strong> {role}</p>
                <p><strong>Permissions:</strong> {isViewer ? "Read-only (cannot add/move tasks)" : "Can add and move tasks"}</p>
            </div>
        </div>
    );
}

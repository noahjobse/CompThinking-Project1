"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/ui/Toast";
import { fetchUsers, createAdminUser } from "@/lib/api";

interface User {
    id: number;
    username: string;
    role: string;
}

export default function UsersPage() {
    const { role } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const isAdmin = role === "Admin";

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!isAdmin) {
            setShowToast(true);
            return;
        }
        
        try {
            await createAdminUser();
            await loadUsers();
        } catch (error) {
            console.error("Failed to add user:", error);
            alert("Failed to add user");
        }
    };

    const handleDeleteUser = (userId: number) => {
        if (!isAdmin) {
            setShowToast(true);
            return;
        }
        alert(`Delete user ${userId} (not implemented yet)`);
    };

    const handleEditUser = (userId: number) => {
        if (!isAdmin) {
            setShowToast(true);
            return;
        }
        alert(`Edit user ${userId} (not implemented yet)`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600">Loading users...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6">
            {showToast && (
                <Toast
                    message="You don't have permission to modify users. Only Admins can manage users."
                    type="warning"
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button
                    onClick={handleAddUser}
                    className={`px-4 py-2 rounded transition-colors text-white ${
                        isAdmin 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    title={!isAdmin ? "Only Admins can add users" : "Add new user"}
                >
                    Add User
                </button>
            </div>

            {!isAdmin && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    <strong>Read-only mode:</strong> Only Admins can add, edit, or delete users.
                </div>
            )}

            <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">{user.id}</td>
                                <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        user.role === "Admin" ? "bg-red-100 text-red-800" :
                                        user.role === "Editor" ? "bg-blue-100 text-blue-800" :
                                        "bg-green-100 text-green-800"
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEditUser(user.id)}
                                            className={`px-3 py-1 text-white rounded text-sm ${
                                                isAdmin 
                                                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                                                    : 'bg-gray-300 cursor-not-allowed'
                                            }`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className={`px-3 py-1 text-white rounded text-sm ${
                                                isAdmin 
                                                    ? 'bg-red-500 hover:bg-red-600' 
                                                    : 'bg-gray-300 cursor-not-allowed'
                                            }`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Your role:</strong> {role}</p>
                <p><strong>Permissions:</strong> {isAdmin ? "Full access (can manage users)" : "Read-only (cannot manage users)"}</p>
            </div>
        </div>
    );
}

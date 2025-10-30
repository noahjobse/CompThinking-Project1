"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/ui/Toast";
import { API_BASE } from "@/lib/api";

interface CursorPresence {
  user: string;
  cursor: number | null;
}

export default function DocumentPage() {
  const { user, role } = useAuth();
  const [content, setContent] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [usersOnline, setUsersOnline] = useState<string[]>([]);
  const [presence, setPresence] = useState<CursorPresence[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isViewer = role === "Viewer";

  // -----------------------------
  // 1. Initial load
  // -----------------------------
  useEffect(() => {
    console.debug("[DOC] useEffect → loadDocument()");
    loadDocument();
  }, []);

  const loadDocument = async () => {
    console.debug("[DOC] Fetching document from API...");
    try {
      const res = await fetch(`${API_BASE}/api/document`);
      const json = await res.json();
      if (res.ok && json.status === "success") {
        setContent(json.data.content || "");
        console.debug("[DOC] Document content loaded successfully");
      } else {
        console.warn("[DOC] Unexpected response:", json);
      }
    } catch (e) {
      console.error("[DOC] Failed to load document:", e);
    } finally {
      setLoading(false);
      console.debug("[DOC] Loading complete");
    }
  };

  // -----------------------------
  // 2. WebSocket setup (safe reconnect)
  // -----------------------------
  useEffect(() => {
    if (!user) {
      console.warn("[WS] No user available, skipping WebSocket init");
      return;
    }

    // avoid duplicate sockets if navigating quickly
    if (wsRef.current && wsRef.current.readyState <= 1) {
      console.log("[WS] Existing connection still open, skipping init");
      return;
    }

    const wsUrl = `${API_BASE.replace("http", "ws")}/ws/document?user=${user.username}`;
    console.log("🌐 [WS] --- INIT ---");
    console.log("🌐 [WS] API_BASE:", API_BASE);
    console.log("🌐 [WS] Constructed URL:", wsUrl);

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
    } catch (err) {
      console.error("💥 [WS] Failed to create WebSocket:", err);
      return;
    }

    const printState = (prefix: string) => {
      if (!ws) return;
      const states = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
      console.log(`[WS] ${prefix} → ${states[ws.readyState] || "?"}`);
    };

    ws.onopen = () => {
      console.log("✅ [WS] Connected", new Date().toISOString());
      printState("onopen");
      (window as any).ws = ws;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "init") {
          setContent(msg.data.document.content);
          setUsersOnline(msg.data.users.map((u: any) => u.user));
          setPresence(msg.data.users);
        } else if (msg.type === "update") {
          setContent(msg.data.content);
        } else if (msg.type === "presence") {
          setPresence(msg.data);
          setUsersOnline(msg.data.map((u: any) => u.user));
        } else {
          console.warn("[WS] Unknown message type:", msg.type);
        }
      } catch (e) {
        console.error("[WS] Failed to parse message:", e);
      }
    };

    ws.onerror = (err) => {
      console.warn("⚠️ [WS] Error event:", err);
      printState("onerror");
    };

    ws.onclose = (event) => {
      console.warn("❌ [WS] Closed:", event.reason || event.code);
      printState("onclose");

      // attempt delayed reconnect (for tab switching)
      if (document.visibilityState === "visible" && !reconnectTimer.current) {
        reconnectTimer.current = setTimeout(() => {
          console.log("[WS] Attempting reconnect...");
          wsRef.current = null;
          reconnectTimer.current = null;
          loadDocument();
        }, 750);
      }
    };

    // debug readyState probes
    const probe = setInterval(() => printState("probe"), 5000);

    // cleanup
    return () => {
      console.log("[WS] Cleanup → closing connection");
      clearInterval(probe);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.close(1000, "unmount");
      }
      wsRef.current = null;
    };
  }, [user?.username]);

  // -----------------------------
  // 3. Send live content updates
  // -----------------------------
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isViewer) {
      console.warn("[EDIT] Viewer attempted to edit document");
      setShowToast(true);
      return;
    }
    const newText = e.target.value;
    setContent(newText);
    sendUpdate(newText);
  };

  const sendUpdate = (newText: string) => {
    const ws = wsRef.current;
    if (!ws) {
      console.error("[EDIT] Cannot send update: wsRef null");
      return;
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "update",
          data: {
            title: "Team Collaboration Workspace",
            content: newText,
            lastEditedBy: user?.username,
          },
        })
      );
    } else {
      console.warn("[EDIT] Skipped send — socket not open");
    }
  };

  // -----------------------------
  // 4. Cursor updates
  // -----------------------------
  const handleCursorChange = () => {
    const pos = textareaRef.current?.selectionStart ?? 0;
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "cursor", data: { position: pos } }));
    }
  };

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const events = ["keyup", "click", "mouseup"];
    events.forEach((ev) => ta.addEventListener(ev, handleCursorChange));
    return () => events.forEach((ev) => ta.removeEventListener(ev, handleCursorChange));
  }, []);

  // -----------------------------
  // 5. Manual Save (REST)
  // -----------------------------
  const handleSave = async () => {
    if (isViewer || !user) {
      setShowToast(true);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/document`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Team Collaboration Workspace",
          content,
          lastEditedBy: user.username,
          lastUpdated: "",
        }),
      });
      const json = await res.json();
      if (res.ok && json.status === "success") {
        setSaveMessage("Document saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        console.warn("[SAVE] Failed:", json);
      }
    } catch (e) {
      console.error("[SAVE] Error:", e);
    }
  };

  const handleTextareaClick = () => {
    if (isViewer) setShowToast(true);
  };

  // -----------------------------
  // 6. Render
  // -----------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading document...</p>
      </div>
    );
  }

  const renderCursors = () => {
    const ta = textareaRef.current;
    if (!ta) return null;
    const lines = content.split("\n");
    return presence
      .filter((p) => p.user !== user?.username && p.cursor !== null)
      .map((p) => (
        <div
          key={p.user}
          title={`${p.user}'s cursor`}
          className="absolute bg-red-500 rounded-full w-2 h-2 animate-pulse"
          style={{
            top: `${Math.min((p.cursor ?? 0) / 80, lines.length) * 20}px`,
            left: "8px",
          }}
        />
      ));
  };

  return (
    <div className="flex flex-col h-full p-6 relative">
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
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          Save Document
        </button>
      </div>

      <div className="mb-3 text-sm text-gray-600">
        Online: {usersOnline.join(", ") || "none"}
      </div>

      {isViewer && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <strong>Read-only mode:</strong> You are viewing this document as a Viewer. Editing is disabled.
        </div>
      )}

      <div className="relative flex-1 flex flex-col border border-gray-300 rounded">
        {renderCursors()}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onClick={handleTextareaClick}
          onFocus={handleTextareaClick}
          readOnly={isViewer}
          className={`flex-1 p-4 resize-none focus:outline-none ${
            isViewer ? "bg-gray-50 text-gray-700 cursor-not-allowed" : ""
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

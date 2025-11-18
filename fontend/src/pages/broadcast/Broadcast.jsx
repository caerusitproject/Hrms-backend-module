import React, { useState, useEffect } from "react";
import { theme } from "../../theme/theme";
import { useAuth } from "../../hooks/useAuth";
import { BroadcastAPI } from "../../api/broadcastApi";
import CustomLoader from "../../components/common/CustomLoader";
import Button from "../../components/common/Button";
import { FiEdit2 } from "react-icons/fi";
const Broadcast = () => {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newBroadcast, setNewBroadcast] = useState({ title: "", content: "" });
  const [filter, setFilter] = useState(""); // "" = all, "today", "yesterday", etc.
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isAdminOrHR = ["HR", "ADMIN"].includes(user?.role);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ------------------- Load broadcasts -------------------
  const loadBroadcasts = async (filterParam = "") => {
    setLoading(true);
    try {
      const res = await BroadcastAPI.getAll(filterParam);
      setBroadcasts(
        res.data.map((b) => ({ ...b, expanded: false })) // add expanded for UI
      );
    } catch (err) {
      console.error("Failed to fetch broadcasts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBroadcasts(filter);
  }, [filter]);

  // ------------------- Modal handlers -------------------
  const handleOpenModal = (id = null) => {
    if (id) {
      const broadcast = broadcasts.find(b => b.id === id);
      if (broadcast) {
        setNewBroadcast({ title: broadcast.title, content: broadcast.content });
      }
      setEditingId(id);
    } else {
      setNewBroadcast({ title: "", content: "" });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewBroadcast({ title: "", content: "" });
    setEditingId(null);
  };

  const handlePublish = async () => {
    if (!newBroadcast.title || !newBroadcast.content) return;
    try {
      const body = { title: newBroadcast.title, content: newBroadcast.content };
      if (editingId) {
        await BroadcastAPI.update(editingId, body);
      } else {
        await BroadcastAPI.create(body);
      }
      handleCloseModal();
      loadBroadcasts(filter); // refresh list
    } catch (err) {
      console.error("Failed to save broadcast", err);
    }
  };

  // ------------------- Expand toggle -------------------
  const toggleExpand = (id) => {
    setBroadcasts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, expanded: !b.expanded } : b))
    );
  };

  // ------------------- Date utils -------------------
  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  // ------------------- Edit permission -------------------
  const canEdit = (broadcast) =>
    isAdminOrHR && isToday(broadcast.createdAt);

  // ------------------- Render -------------------
  const renderBroadcastCard = (broadcast) => (
    <div
      key={broadcast.id}
      style={{
        backgroundColor: theme.colors.surface,
        padding: isMobile ? theme.spacing.sm : theme.spacing.sm,
        borderRadius: theme.borderRadius.large,
        marginBottom: theme.spacing.xl,
        border: `1px solid ${theme.colors.background}`,
        boxShadow: theme.shadows.small,
        transition: "all 0.3s ease",

      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          padding: isMobile ? theme.spacing.sm : theme.spacing.md,
          borderRadius: theme.borderRadius.small,
          backgroundColor: broadcast.expanded ? theme.colors.background : "transparent",
          transition: "background-color 0.2s ease",
        }}
        onClick={() => toggleExpand(broadcast.id)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              margin: "0 0 " + theme.spacing.xs + " 0",
              fontSize: isMobile ? "16px" : "18px",
            }}
          >
            {broadcast.title}
          </h3>
          <p
            style={{
              color: theme.colors.text.secondary,
              margin: 0,
              fontSize: isMobile ? "12px" : "14px",
            }}
          >
            {new Date(broadcast.createdAt).toDateString()}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
          {canEdit(broadcast) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenModal(broadcast.id);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.colors.text.secondary,
                fontSize: isMobile ? "18px" : "20px",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
              title="Edit"
            >
              <FiEdit2 />
            </button>
          )}
          <span
            style={{
              color: theme.colors.text.secondary,
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: 600,
              transition: "transform 0.3s ease",
              transform: broadcast.expanded ? "rotate(180deg)" : "rotate(0deg)",
              cursor: "pointer",
            }}
          >
            {broadcast.expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {broadcast.expanded && (
        <div style={{
          padding: isMobile ? theme.spacing.md : theme.spacing.lg,
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          borderRadius: `0 0 ${theme.borderRadius.small} ${theme.borderRadius.small}`,
        }}>
          <p style={{
            color: theme.colors.text.primary,
            margin: 0,
            lineHeight: 1.6,
            fontSize: isMobile ? "14px" : "16px",
          }}>
            {broadcast.content}
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: theme.spacing.xl }}>
        <CustomLoader />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: theme.spacing.xl }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.lg,
          flexWrap: "wrap",
          gap: theme.spacing.md,
        }}
      >
        <h1 style={{
          fontSize: isMobile ? "28px" : "32px",
          fontWeight: 700,
          color: theme.colors.text.primary,
          margin: 0,
        }}>
          Broadcasts
        </h1>
        {isAdminOrHR && (
          <Button
            type="primary"
            variant="filled"
            size={isMobile ? "small" : "medium"}
            onClick={() => handleOpenModal()}
          >
            + New Broadcast
          </Button>
        )}
      </div>

      {/* Filter buttons */}
      <div style={{
        display: "flex",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.xxl,
        flexWrap: "wrap",
        justifyContent: isMobile ? "center" : "flex-start",
      }}>
        {["", "today", "yesterday", "this-month", "last-month"].map((f) => (
          <Button
            key={f}
            type={filter === f ? "primary" : "secondary"}
            variant={filter === f ? "filled" : "outlined"}
            size={isMobile ? "small" : "medium"}
            onClick={() => setFilter(f)}
          >
            {f === "" ? "All" : f.replace("-", " ")}
          </Button>
        ))}
      </div>

      {/* Broadcast List */}
      <div
        style={{ marginTop: theme.spacing.xxl }}
      >
        {broadcasts.length === 0 ? (
          <p style={{
            color: theme.colors.text.secondary,
            textAlign: "center",
            fontSize: isMobile ? "16px" : "18px",
            margin: theme.spacing.xl + " 0",
          }}>
            No broadcasts available.
          </p>
        ) : (
          broadcasts.map(renderBroadcastCard)
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? theme.spacing.sm : theme.spacing.md,
          }}
          onClick={handleCloseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.large,
              padding: isMobile ? theme.spacing.lg : theme.spacing.xl,
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: theme.shadows.large,
            }}
          >
            <h2 style={{
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: 700,
              color: theme.colors.text.primary,
              marginTop: 0,
              marginBottom: theme.spacing.md,
            }}>
              {editingId ? "Edit Broadcast" : "New Broadcast"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  Heading
                </label>
                <input
                  type="text"
                  placeholder="Enter broadcast heading"
                  value={newBroadcast.title}
                  onChange={(e) =>
                    setNewBroadcast({ ...newBroadcast, title: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.small,
                    fontSize: "15px",
                    color: theme.colors.text.primary,
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                    backgroundColor: theme.colors.surface,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border;
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  Details
                </label>
                <textarea
                  rows={6}
                  placeholder="Enter broadcast details"
                  value={newBroadcast.content}
                  onChange={(e) =>
                    setNewBroadcast({ ...newBroadcast, content: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.small,
                    fontSize: "15px",
                    color: theme.colors.text.primary,
                    outline: "none",
                    transition: "border-color 0.2s",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    backgroundColor: theme.colors.surface,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border;
                  }}
                />
              </div>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: theme.spacing.md,
              marginTop: theme.spacing.lg,
              flexWrap: "wrap",
            }}>
              <Button
                type="secondary"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                variant="filled"
                size={isMobile ? "small" : "medium"}
                onClick={handlePublish}
                disabled={!newBroadcast.title || !newBroadcast.content}
              >
                {editingId ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Broadcast;
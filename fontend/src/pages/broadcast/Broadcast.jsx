import React, { useState, useEffect, useCallback } from "react";
import { theme } from "../../theme/theme";
import { useAuth } from "../../hooks/useAuth";
import { BroadcastAPI } from "../../api/broadcastApi";
import CustomLoader from "../../components/common/CustomLoader";
import Button from "../../components/common/Button";
import { FiEdit2 } from "react-icons/fi";
import { ChevronDown } from "lucide-react";
import { TextField } from "@mui/material";

const Broadcast = () => {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newBroadcast, setNewBroadcast] = useState({ title: "", content: "" });
  const [filter, setFilter] = useState(""); // "" = all
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isAdminOrHR = ["HR", "ADMIN"].includes(user?.role?.toUpperCase());

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fixed: Properly handle both { data: [...] } and raw array responses
  const loadBroadcasts = useCallback(async (filterParam = "") => {
    setLoading(true);
    try {
      const res = await BroadcastAPI.getAll(filterParam);

      // Normalize response safely
      let broadcastsData = [];

      if (Array.isArray(res)) {
        broadcastsData = res;
      } else if (res && res.data && Array.isArray(res.data)) {
        broadcastsData = res.data;
      } else if (res && Array.isArray(res)) {
        broadcastsData = res;
      }

      setBroadcasts(broadcastsData.map((b) => ({ ...b, expanded: false })));
    } catch (err) {
      console.error("Failed to fetch broadcasts", err);
      setBroadcasts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when filter changes
  useEffect(() => {
    loadBroadcasts(filter);
  }, [filter, loadBroadcasts]);

  // Modal handlers
  const handleOpenModal = (id = null) => {
    if (id) {
      const broadcast = broadcasts.find((b) => b.id === id);
      if (broadcast) {
        setNewBroadcast({ title: broadcast.title, content: broadcast.content });
        setEditingId(id);
      }
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
    if (!newBroadcast.title.trim() || !newBroadcast.content.trim()) return;

    try {
      const body = {
        title: newBroadcast.title.trim(),
        content: newBroadcast.content.trim(),
      };

      if (editingId) {
        await BroadcastAPI.update(editingId, body);
      } else {
        await BroadcastAPI.create(body);
      }

      handleCloseModal();
      loadBroadcasts(filter); // Refresh with current filter
    } catch (err) {
      console.error("Failed to save broadcast", err);
    }
  };

  const toggleExpand = (id) => {
    setBroadcasts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, expanded: !b.expanded } : b))
    );
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const canEdit = (broadcast) => isAdminOrHR && isToday(broadcast.createdAt);

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
          backgroundColor: broadcast.expanded
            ? theme.colors.background
            : "transparent",
          transition: "background-color 0.2s ease",
        }}
        onClick={() => toggleExpand(broadcast.id)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              margin: `0 0 ${theme.spacing.xs} 0`,
              fontSize: isMobile ? "16px" : "18px",
              wordBreak: "break-word",
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
            {new Date(broadcast.createdAt).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
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
              display: "inline-flex",
              alignItems: "center",
              transition: "transform 0.3s ease",
              transform: broadcast.expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <ChevronDown size={isMobile ? 20 : 24} />
          </span>
        </div>
      </div>

      {broadcast.expanded && (
        <div
          style={{
            padding: isMobile ? theme.spacing.md : theme.spacing.lg,
            borderTop: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background,
            borderRadius: `0 0 ${theme.borderRadius.small} ${theme.borderRadius.small}`,
          }}
        >
          <p
            style={{
              color: theme.colors.text.primary,
              margin: 0,
              lineHeight: 1.6,
              fontSize: isMobile ? "14px" : "16px",
              whiteSpace: "pre-wrap",
            }}
          >
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
        <h1
          style={{
            fontSize: isMobile ? "28px" : "32px",
            fontWeight: 700,
            color: theme.colors.text.primary,
            margin: 0,
          }}
        >
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

      {/* Filter Buttons */}
      <div
        style={{
          display: "flex",
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xxl,
          flexWrap: "wrap",
          justifyContent: isMobile ? "center" : "flex-start",
        }}
      >
        {[
          { value: "", label: "All" },
          { value: "today", label: "Today" },
          { value: "yesterday", label: "Yesterday" },
          { value: "this-month", label: "This Month" },
          { value: "last-month", label: "Last Month" },
        ].map((f) => (
          <Button
            key={f.value}
            type={filter === f.value ? "primary" : "secondary"}
            variant={filter === f.value ? "filled" : "outlined"}
            size={isMobile ? "small" : "medium"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Broadcast List */}
      <div style={{ marginTop: theme.spacing.xxl }}>
        {broadcasts.length === 0 ? (
          <p
            style={{
              color: theme.colors.text.secondary,
              textAlign: "center",
              fontSize: isMobile ? "16px" : "18px",
              margin: `${theme.spacing.xl} 0`,
            }}
          >
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
            <h2
              style={{
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: 700,
                color: theme.colors.text.primary,
                marginTop: 0,
                marginBottom: theme.spacing.md,
              }}
            >
              {editingId ? "Edit Broadcast" : "New Broadcast"}
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.md,
              }}
            >
              <div>
                <TextField
                  label="Heading"
                  placeholder="Enter broadcast heading"
                  value={newBroadcast.title}
                  onChange={(e) =>
                    setNewBroadcast({ ...newBroadcast, title: e.target.value })
                  }
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: theme.borderRadius.small,
                      "& fieldset": {
                        borderColor: theme.colors.border,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.colors.black,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.colors.primary,
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.colors.primary,
                    },
                  }}
                />
              </div>
              <div>
                <TextField
                  label="Details"
                  placeholder="Enter broadcast details"
                  value={newBroadcast.content}
                  multiline
                  rows={6}
                  onChange={(e) =>
                    setNewBroadcast({
                      ...newBroadcast,
                      content: e.target.value,
                    })
                  }
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: theme.borderRadius.small,
                      "& fieldset": {
                        borderColor: theme.colors.border,
                      },
                      "&:hover fieldset": {
                        borderColor: theme.colors.black,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.colors.primary,
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: theme.colors.primary,
                    },
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: theme.spacing.md,
                marginTop: theme.spacing.lg,
                flexWrap: "wrap",
              }}
            >
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
                disabled={
                  !newBroadcast.title.trim() || !newBroadcast.content.trim()
                }
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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { EmployeeAPI } from "../../api/employeeApi";
import { ManagerAPI } from "../../api/managerApi";
import { theme } from "../../theme/theme";
import Button from "../../components/common/Button";
import CustomLoader from "../../components/common/CustomLoader";

const Teamemployee = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await ManagerAPI.getTeam(user.id);
        setTeamMembers(data || []);
      } catch (err) {
        console.error("Error fetching team members:", err);
        setError(
          err.message.includes("CORS")
            ? "Failed to connect to the server. Please ensure the backend is configured to allow requests from this application."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [user?.id]);

  const handleViewProfile = (id) => {
    navigate(`/employee-profile/${id}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: theme.spacing.xl }}>
        <CustomLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: theme.spacing.xl }}>
        <div style={{ color: theme.colors.error }}>Error: {error}</div>
        <Button
          type="primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: theme.spacing.md }}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.md,
            padding: theme.spacing.sm,
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: theme.colors.text.primary,
              margin: 0,
            }}
          >
            My Team
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.md,
          }}
        >
          {teamMembers.map((member) => (
            <div
              key={member.id}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.large,
                padding: theme.spacing.md,
                boxShadow: theme.shadows.small,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.md,
                  marginBottom: theme.spacing.sm,
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: theme.colors.lightGray,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: theme.colors.text.secondary,
                    flexShrink: 0,
                  }}
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "16px",
                      color: theme.colors.text.primary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {member.name}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: theme.colors.text.secondary,
                      marginTop: "2px",
                    }}
                  >
                    {member.designation || "Team Member"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.sm,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {member.email}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: theme.spacing.sm, // optional spacing from content above
                }}
              >
                <Button
                  type="secondary"
                  onClick={() => handleViewProfile(member.id)}
                >
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop Table View
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.md,
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: theme.colors.text.primary,
            margin: 0,
          }}
        >
          My Team
        </h1>
      </div>
      <div
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.large,
          padding: theme.spacing.xl,
          boxShadow: theme.shadows.small,
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "16px",
            color: theme.colors.text.primary,
            minWidth: "500px",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `2px solid ${theme.colors.background}`,
              }}
            >
              <th
                style={{
                  padding: theme.spacing.md,
                  textAlign: "left",
                  fontWeight: "600",
                  color: theme.colors.text.primary,
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: theme.spacing.md,
                  textAlign: "left",
                  fontWeight: "600",
                  color: theme.colors.text.primary,
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: theme.spacing.md,
                  textAlign: "left",
                  fontWeight: "600",
                  color: theme.colors.text.primary,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr
                key={member.id}
                style={{
                  borderBottom: `1px solid ${theme.colors.lightGray}`,
                  transition: theme.transitions.fast,
                }}
                onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor =
                  theme.colors.background)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <td
                  style={{
                    padding: theme.spacing.md,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.sm,
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: theme.colors.lightGray,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: theme.colors.text.secondary,
                        flexShrink: 0,
                      }}
                    >
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {member.name}
                  </div>
                </td>
                <td style={{ padding: theme.spacing.md }}>
                  <span
                    style={{
                      backgroundColor: theme.colors.background,
                      //padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "15px",
                      display: "inline-block",
                      background:
                        "linear-gradient(90deg, #eb913dff, #feba00ff)", // gradient
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {member.email}
                  </span>
                </td>
                <td style={{ padding: theme.spacing.md }}>
                  <Button
                    type="secondary"
                    onClick={() => handleViewProfile(member.id)}
                  >
                    View Profile
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teamemployee;
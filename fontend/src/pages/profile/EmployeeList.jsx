import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EmployeeAPI } from "../../api/employeeApi";
import { theme } from "../../theme/theme";
import Button from "../../components/common/Button";
import CustomLoader from "../../components/common/CustomLoader";

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await EmployeeAPI.getAllEmployees(currentPage);
        setEmployees(data.employees || []);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message.includes("CORS") ? "CORS error" : err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [currentPage]);


  const handleViewProfile = (id) => {
    let empId = employees.find(emp => emp.id === id)?.id;

    navigate(`/employee-profile/${empId}`);
  };

  const handleAddEmployee = () => {
    navigate("/employee/create");
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
            Employee List
          </h1>
          <Button type="primary" onClick={handleAddEmployee}>
            + Add Employee
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.md,
          }}
        >
          {employees.map((employee) => (
            <div
              key={employee.id}
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
                  {employee.name
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
                    {employee.name}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: theme.colors.text.secondary,
                      marginTop: "2px",
                    }}
                  >
                    {employee.designation}
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
                {employee.email}
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
                  onClick={() => handleViewProfile(employee.id)}
                >
                  View Profile
                </Button>
              </div>
            </div>
          ))}
          {pagination && (pagination.totalPages > 1) && (
          <div style={{ display: "flex", justifyContent: "center",
           gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
            <Button
              type="secondary"
              onClick={() => setCurrentPage(pagination.prevPage)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <span style={{ alignSelf: "center" }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              type="secondary"
              onClick={() => setCurrentPage(pagination.nextPage)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        )}
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
          Employee List
        </h1>
        <Button
          type="primary"
          onClick={handleAddEmployee}
          style={{ backgroundColor: theme.colors.primary }}
        >
          + Add Employee
        </Button>
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
            minWidth: "600px",
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
                Designation
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
            {employees.map((employee) => (
              <tr
                key={employee.id}
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
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    {employee.name}
                  </div>
                </td>
                <td style={{ padding: theme.spacing.md }}>
                  {employee.designation}
                </td>
                <td style={{ padding: theme.spacing.xs }}>
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
                    {employee.email}
                  </span>
                </td>
                <td style={{ padding: theme.spacing.md }}>
                  <Button
                    type="secondary"
                    onClick={() => handleViewProfile(employee.id)}
                  >
                    View Profile
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagination && (pagination.totalPages > 1) && (
          <div style={{ display: "flex", justifyContent: "center", gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
            <Button
              type="secondary"
              onClick={() => setCurrentPage(pagination.prevPage)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <span style={{ alignSelf: "center" }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              type="secondary"
              onClick={() => setCurrentPage(pagination.nextPage)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;

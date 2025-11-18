import React, { useState, useEffect } from "react";
import { EmployeeAPI } from "../../api/employeeApi";
import { theme } from "../../theme/theme";
import CustomLoader from "../../components/common/CustomLoader";
import Button from "../../components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const EmployeeProfileView = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role || "USER";

  const { id } = useParams();
  const currentUserId = Number(user?.id);
  const profileId = Number(id);
  const isOwnProfile = profileId === currentUserId;
  const canEditProfile = ["ADMIN", "HR"].includes(role) || isOwnProfile; // Update this line (use 'role' var for consistency)

  // Responsive check
  const isMobile = window.innerWidth <= 768;

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setLoading(true);
        const [empRes] = await Promise.all([
          // EmployeeAPI.getDepartments(),
          // EmployeeAPI.getAllManagers(),
          EmployeeAPI.fetchEmployeeData(id),
        ]);

        // const deptResData = Array.isArray(deptRes) ? deptRes : [];
        // const mgrResData = Array.isArray(mgrRes?.data) ? mgrRes.data : [];
        // setDepartments(deptResData);
        // setManagers(mgrResData);

        const data = empRes;
        // const dept =
        //   deptResData.find((d) => Number(d.id) === Number(data.departmentId))
        //     ?.departmentName || "N/A";
        // const mgr = mgrResData.find(
        //   (m) => Number(m.id) === Number(data.managerId)
        // )?.name;
        const age = calculateAge(data.dateOfBirth);

        const transformedData = {
          personalDetails: {
            fullName: data.name || "N/A",
            contactNumber: data.mobile || data.phone || "N/A",
            gender: data.gender || "N/A",
            maritalStatus: data.maritalStatus || "N/A",
            fatherName: data.fatherName || "N/A",
            address: data.address || "N/A",
            city: data.city || "N/A",
            country: data.country || "N/A",
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth).toLocaleDateString()
              : "N/A",
            age: age !== null ? age : "N/A",
          },
          professionalDetails: {
            designation: data.designation || "N/A",
            department: data?.department?.departmentName,
            dateOfJoining: data.joiningDate
              ? new Date(data.joiningDate).toLocaleDateString()
              : "N/A",
           reportingManager: data?.Manager?.name || "",
            employeeId: data.id || "N/A",
            empCode: data.empCode || "N/A",
            employmentType: data.employmentType || "N/A",
            role,
            email: data.email || "N/A",
            idNumber: data.idNumber || "N/A",
          },
          avatar: null,
        };
        setEmployee(transformedData);
      } catch (err) {
        setError(
          err.message.includes("CORS")
            ? "Failed to connect to the server. Please ensure the backend allows requests."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };
    loadEmployeeData();
  }, [id]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: theme.spacing.xl }}>
        <CustomLoader />
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: "center", padding: theme.spacing.xl }}>
        <div style={{ color: theme.colors.error }}>Error: {error}</div>
      </div>
    );

  if (!employee) return null;

  // 🔹 Styled helpers
  const sectionStyle = (highlight) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    boxShadow: highlight ? theme.shadows.medium : theme.shadows.small,
    borderRight: highlight ? `4px solid ${theme.colors.primary}` : "none",
    transition: theme.transitions.medium,
  });

  const labelStyle = {
    fontSize: "14px",
    fontWeight: 500,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  };

  const valueStyle = {
    fontSize: "16px",
    fontWeight: 600,
    color: theme.colors.primary,
  };

  const createGridItem = (label, value) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>{label}</label>
      <div style={valueStyle}>{value}</div>
    </div>
  );

  const dobWithAge = `${employee.personalDetails?.dateOfBirth || "N/A"}${
    employee.personalDetails?.age !== "N/A"
      ? ` (${employee.personalDetails?.age} years)`
      : ""
  }`;

  // 🔹 Card swap logic: on desktop → personal styled like professional; on mobile → reversed
  const personalCardStyle = isMobile
    ? sectionStyle(false)
    : sectionStyle(false);
  const professionalCardStyle = isMobile
    ? sectionStyle(false)
    : sectionStyle(false);

  const dummyDocuments = [
    { name: "Offer Letter", icon: "📄" },
    { name: "ID Proof", icon: "🆔" },
    { name: "Tax Document", icon: "📋" },
  ];

  return (
    <div>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.md,
          position: "sticky",
          top: 0,
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          //backgroundColor: theme.colors.surface,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "650",
            color: theme.colors.text.primary,
            margin: 0,
          }}
        >
          Employee Profile
        </h1>
        {canEditProfile && (
          <Button
            type="primary"
            onClick={() => navigate(`/employee/edit/${id}`)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Avatar Card */}
      <div style={sectionStyle(true)}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: theme.borderRadius.round,
              backgroundColor: theme.colors.background,
              border: `3px solid ${theme.colors.lightGray}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 600,
              color: theme.colors.text.secondary,
              backgroundImage: employee.avatar
                ? `url(${employee.avatar})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!employee.avatar &&
              employee.personalDetails?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
              {employee.personalDetails?.fullName || "N/A"}
            </h2>
            <p style={{ margin: 0, color: theme.colors.text.secondary }}>
              {employee.professionalDetails?.designation || "N/A"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: theme.colors.text.secondary,
              }}
            >
              Employee ID : <strong>{employee.professionalDetails?.empCode || "N/A"}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div style={personalCardStyle}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: theme.spacing.md,
          }}
        >
          Personal Details
        </h2>
        <div
          className="profile-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: theme.spacing.sm,
          }}
        >
          {createGridItem("Full Name", employee.personalDetails?.fullName)}
          {createGridItem(
            "Contact Number",
            employee.personalDetails?.contactNumber
          )}
          {createGridItem("Gender", employee.personalDetails?.gender)}
          {createGridItem("Date of Birth", dobWithAge)}
          {createGridItem(
            "Marital Status",
            employee.personalDetails?.maritalStatus
          )}
          {createGridItem(
            "Father's Name",
            employee.personalDetails?.fatherName
          )}
          {createGridItem("Address", employee.personalDetails?.address)}
          {createGridItem("City", employee.personalDetails?.city)}
          {createGridItem("Country", employee.personalDetails?.country)}
        </div>
      </div>

      {/* Professional Details */}
      <div style={professionalCardStyle}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: theme.spacing.md,
          }}
        >
          Professional Details
        </h2>
        <div
          className="profile-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: theme.spacing.sm,
          }}
        >
          {createGridItem(
            "Employee Code",
            employee.professionalDetails?.empCode
          )}
          {createGridItem("Email Address", employee.professionalDetails?.email)}
          {createGridItem("ID Number", employee.professionalDetails?.idNumber)}
          {createGridItem(
            "Designation",
            employee.professionalDetails?.designation
          )}
          {createGridItem(
            "Department",
            employee.professionalDetails?.department
          )}
          {createGridItem(
            "Employment Type",
            employee.professionalDetails?.employmentType
          )}
          {createGridItem(
            "Date of Joining",
            employee.professionalDetails?.dateOfJoining
          )}
          {/* {createGridItem("Role", employee.professionalDetails?.role)} */}
          
          {employee.professionalDetails?.reportingManager &&
            createGridItem(
              "Reporting Manager",
              employee.professionalDetails?.reportingManager
            )}
        </div>
      </div>

      {/* Supportive Documents */}
      <div style={sectionStyle(false)}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: theme.spacing.md,
          }}
        >
          Supportive Documents
        </h2>
        {dummyDocuments.map((doc, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: theme.colors.background,
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.small,
              border: `1px solid ${theme.colors.lightGray}`,
              marginBottom: theme.spacing.sm,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.sm,
              }}
            >
              <span style={{ fontSize: "18px" }}>{doc.icon}</span>
              <span
                style={{ fontWeight: 600, color: theme.colors.text.primary }}
              >
                {doc.name}
              </span>
            </div>
            <button
              onClick={() => alert(`Viewing ${doc.name}`)}
              style={{
                backgroundColor: "transparent",
                color: theme.colors.warning,
                border: "none",
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeProfileView;

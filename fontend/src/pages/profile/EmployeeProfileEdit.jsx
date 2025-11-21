import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { EmployeeAPI } from "../../api/employeeApi";
import { theme } from "../../theme/theme";
import { UploadAPI } from "../../api/uploadApi";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import CustomLoader from "../../components/common/CustomLoader";
import { ROLE_OPTIONS, ROLE_IDS } from "../../utils/roles";

const EmployeeProfileEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;
  const role = user?.role || "USER";
  const currentUserId = Number(user?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm();
  const watchMobile = useWatch({
    control,
    name: "personalDetails.mobile",
  });

  const sectionStyle = (highlight) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    boxShadow: highlight ? theme.shadows.medium : theme.shadows.small,
    borderRight: highlight ? `4px solid ${theme.colors.primary}` : "none",
    transition: theme.transitions.medium,
  });

  const dummyDocuments = [
    { name: "Offer Letter", icon: "📄" },
    { name: "ID Proof", icon: "🆔" },
    { name: "Tax Document", icon: "📋" },
  ];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null);
  const [currentManagerId, setCurrentManagerId] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null); // new
  const [avatarUploading, setAvatarUploading] = useState(false); // new
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isProfessionalEditable = ["HR", "ADMIN"].includes(role);
  const isOwnProfile = isEditMode && parseInt(id) === currentUserId;
  const canEditPersonal =
    !isEditMode || ["HR", "ADMIN"].includes(role) || isOwnProfile;
  const canSave = !isEditMode || canEditPersonal || isProfessionalEditable;
  const empPrefix = process.env.REACT_APP_EMP_PREFIX || "EMP";

  const generateEmpCode = () =>
    `${empPrefix}${Math.floor(1000 + Math.random() * 9000)}`;

  const onError = (errors) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const element = document.querySelector(
        `input[name="${firstErrorKey}"], select[name="${firstErrorKey}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isProfessionalEditable) {
          const [deptRes, mgrRes] = await Promise.all([
            EmployeeAPI.getDepartments(),
            EmployeeAPI.getAllManagers(),
          ]);

          setDepartments(deptRes || []);
          setManagers(mgrRes?.data || []);
        }

        if (isEditMode) {
          const data = await EmployeeAPI.fetchEmployeeData(id);

          setValue("personalDetails.fullName", data.name || "");
          setValue("personalDetails.dateOfBirth", data.dateOfBirth || "");
          setValue("personalDetails.gender", data.gender || "");
          setValue("personalDetails.maritalStatus", data.maritalStatus || "");
          setValue("personalDetails.fatherName", data.fatherName || "");
          setValue("personalDetails.address", data.address || "");
          setValue("personalDetails.city", data.city || "");
          setValue("personalDetails.country", data.country || "");
          setValue("personalDetails.mobile", data.mobile || "");
          setValue("personalDetails.phone", data.phone || "");
          setValue("professionalDetails.designation", data.designation || "");

          setCurrentDepartmentId(data.departmentId);
          setCurrentManagerId(data.managerId);

          if (isProfessionalEditable) {
            // Editable users (HR/Admin) — keep using IDs for dropdowns
            setValue(
              "professionalDetails.department",
              data.departmentId ? data.departmentId.toString() : ""
            );
            setValue(
              "professionalDetails.reportingManager",
              data.managerId ? data.managerId.toString() : ""
            );
          } else {
            // Non-editable users — show names instead of IDs
            setValue(
              "professionalDetails.department",
              data?.department?.departmentName || ""
            );
            setValue(
              "professionalDetails.reportingManager",
              data?.Manager?.name || ""
            );
          }
          setValue("professionalDetails.idNumber", data.idNumber || "");
          setValue("professionalDetails.email", data.email || "");
          setValue(
            "professionalDetails.employmentType",
            data.employmentType || ""
          );
          setValue("professionalDetails.dateOfJoining", data.joiningDate || "");

          const nameToId = {
            ADMIN: ROLE_IDS.ADMIN,
            HR: ROLE_IDS.HR,
            MANAGER: ROLE_IDS.MANAGER,
            USER: ROLE_IDS.EMPLOYEE, // USER → EMPLOYEE
          };
          console.log(data.roles?.[0]?.role);

          const roleId = nameToId[data.roles?.[0]?.role] ?? ROLE_IDS.EMPLOYEE;
          console.log(roleId);
          setValue("professionalDetails.role", roleId);
        } else {
          setValue("professionalDetails.empCode", generateEmpCode());
          setValue("professionalDetails.role", 4);
          setValue("professionalDetails.employmentType", "Full-time");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode, setValue]);

  // Load real profile image when editing existing employee
  useEffect(() => {
    if (!isEditMode || !id) return;

    const loadProfileImage = async () => {
      try {
        const res = await UploadAPI.getProfileImage(id);
        if (res && res.length > 0) {
  const filePath = res[0].file_path;
  const fileName = filePath.split("\\").pop().split("/").pop();

  console.log("Extracted filename:", fileName);

  const imageUrl = UploadAPI.getFileURL(fileName);
  console.log("Final image URL:", imageUrl);

  setAvatarPreview(imageUrl + `?t=${Date.now()}`); 
}

      } catch (err) {
        console.log("No profile image or failed to load:", err.message);
        // Keep avatarPreview as null → shows initials
      }
    };

    loadProfileImage();
  }, [id, isEditMode]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !id) return;

    // Immediate preview
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
    setAvatarUploading(true);

    try {
      await UploadAPI.uploadProfile(id, file);

      // Refresh image URL from server (to avoid cache)
      const res = await UploadAPI.getProfileImage(id);
      if (res && res.length > 0) {
        const fileName = res[0].file_path;
        console.log("Uploaded file name:", fileName);
        setAvatarPreview(UploadAPI.getFileURL(fileName));
      }
    } catch (err) {
      setError("Failed to upload profile picture");
      console.error(err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const apiPayload = {
        name: data.personalDetails?.fullName,
        dateOfBirth: data.personalDetails?.dateOfBirth,
        gender: data.personalDetails?.gender,
        maritalStatus: data.personalDetails?.maritalStatus,
        fatherName: data.personalDetails?.fatherName,
        address: data.personalDetails?.address,
        city: data.personalDetails?.city,
        country: data.personalDetails?.country,
        mobile: data.personalDetails?.mobile,
        phone: data.personalDetails?.phone,
        email: data.professionalDetails?.email,
        idNumber: data.professionalDetails?.idNumber,
        designation: data.professionalDetails?.designation,
        employmentType: data.professionalDetails?.employmentType,
        joiningDate: data.professionalDetails?.dateOfJoining,
        roleIds: parseInt(data.professionalDetails?.role),
      };

      const getDepartmentId = () =>
        isEditMode && !isProfessionalEditable
          ? currentDepartmentId
          : parseInt(data.professionalDetails?.department || null);
      const getManagerId = () =>
        isEditMode && !isProfessionalEditable
          ? currentManagerId
          : parseInt(data.professionalDetails?.reportingManager || null);

      apiPayload.departmentId = getDepartmentId();
      apiPayload.managerId = getManagerId();

      if (!isEditMode) {
        apiPayload.password = data.professionalDetails?.password;
        apiPayload.empCode =
          data.professionalDetails?.empCode || generateEmpCode();
        // apiPayload.status = "Active";
        // apiPayload.state = "OFFER_CREATED";
      }

      if (isEditMode) {
        await EmployeeAPI.updateEmployee(id, apiPayload);
        navigate(`/employee-profile/${id}`);
      } else {
        const res = await EmployeeAPI.createEmployee(apiPayload);
        navigate(
          `/employee-profile/${res.employee?.id || res.data?.employee?.id}`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () =>
    navigate(isEditMode ? `/employee-profile/${id}` : "/employees-list");

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: theme.spacing.xl }}>
        <CustomLoader />
      </div>
    );

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: isMobile ? theme.spacing.sm : theme.spacing.md,
  };

  const departmentOptions = [
    { value: "", label: "Select Department" },
    ...departments.map((d) => ({ value: d.id, label: d.departmentName })),
  ];

  const managerOptions = [
    { value: "", label: "Select Reporting Manager" },
    ...managers.map((m) => ({ value: m.id, label: m.name })),
  ];

  const roleOptions = ROLE_OPTIONS;

  const employmentTypeOptions = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Contractual", label: "Contractual" },
    { value: "Other", label: "Other" },
  ];

  const genderTypeOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];
  const validateAge = (dob) => {
    if (!dob) return "Date of birth is required";
    const birth = new Date(dob);
    const today = new Date();
    const age =
      today.getFullYear() -
      birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
        ? 1
        : 0);
    return age >= 18 || "Employee must be at least 18 years old";
  };

  const validateMobile = (mobile) => {
    if (!mobile) return true;
    if (!mobile.startsWith("+91")) return "Mobile number must start with +91";
    const digits = mobile.replace("+91", "");
    if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
      return "Mobile number must be 10 digits after +91";
    }
    return true;
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    if (!phone.startsWith("+91")) return "Phone number must start with +91";
    const digits = phone.replace("+91", "");
    if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
      return "Phone number must be 10 digits after +91";
    }
    if (phone === watchMobile) {
      return "Alternative phone number cannot be the same as mobile number";
    }
    return true;
  };

  const maritalStatusOptions = [
    { value: "", label: "Select Marital Status" },
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Divorced", label: "Divorced" },
    { value: "Widowed", label: "Widowed" },
  ];

  const isProfessionalFieldDisabled = isEditMode && !isProfessionalEditable;
  const isPersonalFieldDisabled = isEditMode && !canEditPersonal;
  const isSupportingDocsEditable = isProfessionalEditable;

  return (
    <>
      <div style={{ paddingBottom: theme.spacing.xl }}>
        {error && (
          <div
            style={{
              color: theme.colors.error,
              marginBottom: theme.spacing.md,
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.error + "10",
              borderRadius: theme.borderRadius.small,
            }}
          >
            {error}
          </div>
        )}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "650",
            color: theme.colors.text.primary,
            margin: "0 0 " + theme.spacing.lg + " 0",
          }}
        >
          {isEditMode ? "Edit Employee Profile" : "Create Employee Profile"}
        </h1>

        {/* Avatar */}
        {isEditMode && (
          <div
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.large,
              padding: theme.spacing.lg,
              boxShadow: theme.shadows.small,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.xl,
              flexWrap: "wrap",
              flexDirection: isMobile ? "column" : "row",
              marginBottom: theme.spacing.lg,
              justifyContent: isMobile ? "center" : "flex-start",
              position: "relative",
            }}
          >
            <div style={{ position: "relative" }}>
              {/* Avatar Circle */}
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  backgroundColor: avatarPreview
                    ? "transparent"
                    : theme.colors.surfaceVariant,
                  border: `4px solid ${theme.colors.primary}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "36px",
                  color: theme.colors.primary,
                  backgroundImage: avatarPreview
                    ? `url(${avatarPreview})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                {/* Initials fallback */}
                {!avatarPreview &&
                  (watch("personalDetails.fullName") || "U")
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase())
                    .join("")}
              </div>

              {/* Upload button - ONLY for HR, ADMIN or Own Profile */}
              {canEditPersonal && (
                <>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="avatar-upload"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.colors.primary,
                      color: "white",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      fontSize: "18px",
                    }}
                    title="Change Profile Picture"
                  >
                    {avatarUploading ? "..." : ""}
                  </label>
                </>
              )}

              {/* Optional: Loading overlay */}
              {avatarUploading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "14px",
                  }}
                >
                  Uploading...
                </div>
              )}
            </div>

            <div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
                {watch("personalDetails.fullName") || "Employee Name"}
              </h3>
              <p style={{ margin: 0, color: theme.colors.text.secondary }}>
                {watch("professionalDetails.designation") || "Designation"}
              </p>
            </div>
          </div>
        )}
        {/* Personal Details */}
        <FormCard title="Personal Details">
          <div style={gridStyle}>
            <Input
              label="Full Name"
              name="personalDetails.fullName"
              register={register}
              required
              rules={{
                required: "Full Name is required",
                validate: (value) => {
                  const trimmed = value?.trim();
                  return (
                    trimmed?.length >= 3 ||
                    "Full Name must be at least 3 character"
                  );
                },
              }}
              disabled={isPersonalFieldDisabled}
              errors={errors}
            />

            <Input
              label="Date of Birth"
              name="personalDetails.dateOfBirth"
              type="date"
              register={register}
              required
              rules={{
                validate: validateAge,
              }}
              disabled={isPersonalFieldDisabled}
              errors={errors}
            />
            <Input
              label="Gender"
              name="personalDetails.gender"
              type="select"
              options={genderTypeOptions}
              register={register}
              required
              disabled={isPersonalFieldDisabled}
              errors={errors}
            />

            <Input
              label="Father's Name"
              name="personalDetails.fatherName"
              register={register}
              disabled={isPersonalFieldDisabled}
              errors={errors}
            />
            <Input
              label="Address"
              name="personalDetails.address"
              register={register}
              required
              disabled={isPersonalFieldDisabled}
              errors={errors}
            />
            <Input
              label="City"
              name="personalDetails.city"
              register={register}
              disabled={isPersonalFieldDisabled}
              errors={errors}
            />
            <Input
              label="Country"
              name="personalDetails.country"
              register={register}
              required
              disabled={isPersonalFieldDisabled}
              errors={errors}
            />
            <Input
              label="Mobile"
              name="personalDetails.mobile"
              type="tel"
              register={register}
              required
              rules={{
                validate: validateMobile,
              }}
              disabled={isPersonalFieldDisabled}
              errors={errors}
              placeholder="+91xxxxxxxxxx"
            />
            <Input
              label="Alternative Mobile"
              name="personalDetails.phone"
              type="tel"
              register={register}
              rules={{
                validate: validatePhone,
              }}
              disabled={isPersonalFieldDisabled}
              errors={errors}
              placeholder="+91xxxxxxxxxx"
            />

            <Input
              label="Marital Status"
              name="personalDetails.maritalStatus"
              type="select"
              options={maritalStatusOptions}
              register={register}
              disabled={isPersonalFieldDisabled}
              errors={errors}
            />
          </div>
        </FormCard>

        {/* Professional Details */}
        <FormCard title="Professional Details">
          <div style={gridStyle}>
            {/* {!isEditMode && (
              <Input
                label="Employee Code"
                name="professionalDetails.empCode"
                disabled
                register={register}
                errors={errors}
              />
            )} */}
            <Input
              label="Role"
              name="professionalDetails.role"
              type="select"
              options={roleOptions}
              register={register}
              required
              disabled={isProfessionalFieldDisabled}
              errors={errors}
            />
            <Input
              label="Department"
              name="professionalDetails.department"
              type={isProfessionalEditable ? "select" : "text"}
              options={departmentOptions}
              register={register}
              required
              disabled={isProfessionalFieldDisabled}
              errors={errors}
            />
            <Input
              label="Designation"
              name="professionalDetails.designation"
              register={register}
              required
              disabled={isProfessionalFieldDisabled}
              errors={errors}
            />
            <Input
              label="ID Number"
              name="professionalDetails.idNumber"
              register={register}
              required
              disabled={isProfessionalFieldDisabled}
              errors={errors}
            />
            <Input
              label="Email"
              name="professionalDetails.email"
              type="email"
              register={register}
              required
              disabled={isProfessionalFieldDisabled}
              errors={errors}
            />

            {!isEditMode && (
              <Input
                label="Password"
                name="professionalDetails.password"
                type="password"
                register={register}
                required
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                errors={errors}
              />
            )}

            <Input
              label="Employment Type"
              name="professionalDetails.employmentType"
              type="select"
              options={employmentTypeOptions}
              register={register}
              disabled={isProfessionalFieldDisabled}
              errors={errors}
            />

            <Input
              label="Reporting Manager"
              name="professionalDetails.reportingManager"
              type={isProfessionalEditable ? "select" : "text"}
              options={managerOptions}
              register={register}
              disabled={isProfessionalFieldDisabled}
              errors={errors}
            />

            <Input
              label="Date of Joining"
              name="professionalDetails.dateOfJoining"
              type="date"
              register={register}
              disabled={isProfessionalFieldDisabled}
              errors={errors}
            />
          </div>
        </FormCard>
        {isSupportingDocsEditable && (
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
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                    }}
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
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
          padding: theme.spacing.md,
          display: "flex",
          justifyContent: isMobile ? "space-between" : "flex-end",
          gap: theme.spacing.sm,
          zIndex: 10,
          boxShadow: theme.shadows.small,
        }}
      >
        <Button type="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit(onSubmit, onError)}
          disabled={saving || (isEditMode && !canSave)}
        >
          {saving ? "Saving..." : isEditMode ? "Save Changes" : "Create"}
        </Button>
      </div>
    </>
  );
};

/* ---------- Helper Components ---------- */
const FormCard = ({ title, children }) => (
  <div
    style={{
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      boxShadow: theme.shadows.small,
    }}
  >
    <h2
      style={{
        color: theme.colors.primary,
        borderBottom: `2px solid ${theme.colors.background}`,
        paddingBottom: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        fontWeight: 600,
        fontSize: "18px",
      }}
    >
      {title}
    </h2>
    {children}
  </div>
);

export default EmployeeProfileEdit;

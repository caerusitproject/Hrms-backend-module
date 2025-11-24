const onBoarding = sequelize.define("Onboarding", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employeeId: { type: DataTypes.INTEGER },
    offerAccepted: { type: DataTypes.BOOLEAN, defaultValue: false },
    documentsSubmitted: { type: DataTypes.BOOLEAN, defaultValue: false },
    verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.STRING, defaultValue: "OFFER_CREATED" },
    workflowId: DataTypes.INTEGER
  }, { tableName: "onboardings" });
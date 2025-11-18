const config = {
  webSiteUrl: String(process.env.REACT_APP_WEBSITE_URL),
  webHipSiteUrl: String(process.env.REACT_APP_HIP_WEBSITE_URL),
  webOtplessServiceUrl: String(process.env.REACT_APP_OTPLESS_WEBSITE_URL),
  webHiuSiteUrl: String(process.env.REACT_APP_HIU_WEBSITE_URL),
  webFhirSiteUrl: String(process.env.REACT_APP_FHIR_WEBSITE_URL),
  hipId: String(process.env.REACT_APP_HIP_ID),
  hipName: String(process.env.REACT_APP_HIP_NAME),
  hprHfrUrl: String(process.env.REACT_APP_HPR_HFR_URL),
  googleAuthUrl: String(process.env.REACT_APP_GOOGLE_AUTH_URL),
  envValue: String(process.env.REACT_APP_ENV_NAME),
  loginUrl: String(process.env.REACT_APP_LOGIN_URL),
  patientCare: String(process.env.REACT_APP_APPOINTMENT_WEBSITE_URL),
  paymentsUrl: String(process.env.REACT_APP_PAYMENTS_URL),
  manageAbhaUrl: String(process.env.REACT_APP_MANAGE_ABHA_WEBSITE_URL),
  hpIdSuffix: String(process.env.REACT_APP_HP_ID_SUFFIX),
  nhcxServiceUrl: String(process.env.REACT_APP_NHCX_SERVICE_URL),
  hprEnabled: process.env.REACT_APP_HPR_ENABLED === 'true',
  hfrEnabled: process.env.REACT_APP_HFR_ENABLED === 'true',
  ipdEnabled: process.env.REACT_APP_IPD_ENABLED === 'true',
  claimsEnabled: process.env.REACT_APP_CLAIMS_ENABLED === 'true',
  swingbellLogo: String(process.env.REACT_APP_SWINGBELL_LOGO),
  razorpayServiceUrl: String(process.env.REACT_APP_RAZORPAY_SERVICE_URL),
  newOpdEnabled: process.env.REACT_APP_NEW_OPD_ENABLED === 'true',
}


export default config;
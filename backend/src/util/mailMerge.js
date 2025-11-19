
// exports.mergePayload = (template, payload) => {
//   let merged = template;
//     for (const key in payload) {
//         const placeholder = `{{${key}}}`;
//         const value = payload[key];
//         merged = merged.split(placeholder).join(value);
//     }   
//     return merged;
// };

exports.setPayload = async (wf,type,initiator) =>{
   const message={
    type:"Workflow_onboarding_init",
    email: initiator.email,
    subject:"Onboarding Process Started",
    payload:{
      name:initiator.name,
     // message:`Onboarding process has been started for you.`,
      email: initiator.email,
      type:type,//"Workflow_onboarding_init",
      onboardingFor:wf.employee.name,
      onboardingEmpCode:wf.employee.empCode
    }
  }
    return message;
};



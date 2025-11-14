module.exports = {
    leave : {
        INITIATED: "INITIATED",
        PENDING_APPROVAL: "PENDING_APPROVAL",
        APPROVED: "APPROVED",
        REJECTED: "REJECTED",
        COMPLETED: "COMPLETED",

    }
  
};

/*module.exports = {
  leave: {
    initialState: 'draft',
    transitions: {
      draft: ['awaiting_manager', 'cancelled'],
      awaiting_manager: ['approved', 'rejected', 'cancelled'],
      approved: ['cancelled'],
      rejected: [],
      cancelled: []
    },
    onEnter: {
      awaiting_manager: ['notifyManager'],
      approved: ['applyLeaveBalance', 'notifyEmployee'],
      rejected: ['notifyEmployee']
    }
  },

  payroll: {
    initialState: 'pending',
    transitions: {
      pending: ['processing', 'failed'],
      processing: ['processed', 'failed'],
      processed: ['paid'],
      failed: []
    },
    onEnter: {
      processing: ['computePayroll'],
      processed: ['generatePayslip'],
      paid: ['notifyEmployee']
    }
  },

  onboarding: {
    initialState: 'not_started',
    transitions: {
      not_started: ['in_progress'],
      in_progress: ['completed'],
      completed: []
    },
    onEnter: {
      in_progress: ['createOnboardingTasks'],
      completed: ['notifyHR']
    }
  },

  offboarding: {
    initialState: 'initiated',
    transitions: {
      initiated: ['tasks_pending'],
      tasks_pending: ['cleared', 'blocked'],
      cleared: ['completed'],
      blocked: []
    },
    onEnter: {
      tasks_pending: ['createOffboardingTasks'],
      cleared: ['terminateEmployee']
    }
  },

  appraisal: {
    initialState: 'initiated',
    transitions: {
      initiated: ['under_review'],
      under_review: ['completed'],
      completed: []
    },
    onEnter: {
      under_review: ['notifyReviewer'],
      completed: ['applySalaryChange', 'notifyEmployee']
    }
  }
};*/

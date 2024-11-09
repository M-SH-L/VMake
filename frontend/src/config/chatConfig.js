export const questions = [
  {
    id: 'name',
    text: '👋 Hi! I\'m here to help you with your electronics/robotics project. What\'s your name?',
    validation: (input) => {
      if (!input.trim()) return 'Name is required';
      return null;
    }
  },
  {
    id: 'email',
    text: 'What is your email address?',
    validation: (input) => {
      if (!input.trim()) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) return 'Please enter a valid email';
      return null;
    }
  },
  {
    id: 'phone',
    text: 'What is your phone number?',
    validation: (input) => {
      if (!input.trim()) return 'Phone number is required';
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(input)) return 'Please enter a valid 10-digit phone number';
      return null;
    }
  },
  {
    id: 'projectName',
    text: 'What is the name of your project?',
    validation: (input) => {
      if (!input.trim()) return 'Project name is required';
      return null;
    }
  },
  {
    id: 'description',
    text: 'Please provide a detailed description of your project:',
    validation: (input) => {
      if (!input.trim()) return 'Project description is required';
      if (input.length < 10) return 'Please provide more details';
      return null;
    }
  },
  {
    id: 'timeline',
    text: 'What\'s your expected timeline for completing this project?',
    validation: (input) => {
      if (!input.trim()) return 'Timeline is required';
      return null;
    }
  },
  {
    id: 'budget',
    text: 'What\'s your budget for this project (in INR)?',
    validation: (input) => {
      if (!input.trim()) return 'Budget is required';
      const budgetNum = parseFloat(input.replace(/[^0-9.]/g, ''));
      if (isNaN(budgetNum)) return 'Please enter a valid budget amount';
      return null;
    }
  },
  {
    id: 'location',
    text: 'Where are you located? This helps us plan logistics:',
    validation: (input) => {
      if (!input.trim()) return 'Location is required';
      return null;
    }
  }
];

export const botResponses = {
  greeting: "Welcome! I'm here to help you plan your electronics/robotics project.",
  analyzing: "📊 Analyzing your project requirements and generating recommendations...",
  partsListGenerated: "I've analyzed your project and prepared a parts list. Here's what you'll need:",
  optionsPrompt: "Would you like to proceed with one of these options?",
  paymentPrompt: "Great choice! To proceed, please complete the payment of ₹499 using the UPI details below:",
  completion: "Thank you! Your submission has been recorded. Someone from the VMake team will contact you within 24-48 hours.",
  paymentConfirmation: "Payment received! We've recorded your request and our team will be in touch soon."
};

export const serviceOptions = {
  EXPERT_BUILD: {
    id: 'expertBuild',
    text: 'Get started with expert build assistance',
    price: 499,
    description: 'Our experts will analyze your project in detail and provide a comprehensive build plan.'
  },
  GUIDANCE_CALL: {
    id: 'guidanceCall',
    text: 'Schedule a basic guidance call',
    price: 499,
    description: '30-minute consultation call with our electronics expert.'
  }
};

export const upiDetails = {
  id: 'vmake@upi',
  name: 'VMake Technologies'
};

export const currencyConfig = {
  DEFAULT_CURRENCY: 'INR',
  formatAmount: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
};
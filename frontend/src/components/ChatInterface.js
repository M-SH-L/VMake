// src/components/ChatInterface.js
import api from '../services/api';
import React, { useState, useRef, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { questions, botResponses, serviceOptions, upiDetails, currencyConfig } from '../config/chatConfig';
import { processProject, storeProject, verifyPayment, updateProjectStatus } from '../services/api';

// Component for displaying service options
const ServiceOptions = ({ onSelect }) => (
  <Box sx={{ mt: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
    {Object.values(serviceOptions).map((option) => (
      <Card 
        key={option.id} 
        sx={{ 
          cursor: 'pointer',
          '&:hover': { backgroundColor: '#f5f5f5' }
        }}
        onClick={() => onSelect(option)}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {option.text}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {option.description}
          </Typography>
          <Typography variant="h6" color="primary">
            {currencyConfig.formatAmount(option.price)}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </Box>
);

// Component for displaying payment details
const PaymentDetails = ({ selectedOption }) => (
  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
    <Typography variant="h6" gutterBottom>
      Payment Details
    </Typography>
    <Typography variant="body1" gutterBottom>
      Amount: {currencyConfig.formatAmount(selectedOption.price)}
    </Typography>
    <Typography variant="body1" gutterBottom>
      UPI ID: {upiDetails.id}
    </Typography>
    <Typography variant="body1" gutterBottom>
      Payee Name: {upiDetails.name}
    </Typography>
    <Alert severity="info" sx={{ mt: 2 }}>
      After completing the payment, please enter the UPI transaction ID below to confirm your payment.
    </Alert>
  </Box>
);

// Component for displaying parts list
const PartsListDisplay = ({ partsList, analysis }) => {
  if (!partsList || !partsList.parts) return null;

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>Project Analysis & Parts List</Typography>
      
      {analysis && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Analysis Summary:</Typography>
          <Typography variant="body2" gutterBottom>
            Feasibility: {analysis.feasibility}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Complexity Level: {analysis.complexity}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Estimated Time: {analysis.estimatedTime}
          </Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Component</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Price (₹)</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {partsList.parts.map((part, index) => (
              <TableRow key={index}>
                <TableCell>{part.name} {part.optional && '(Optional)'}</TableCell>
                <TableCell align="center">{part.quantity}</TableCell>
                <TableCell align="right">
                  {currencyConfig.formatAmount(part.price)}
                </TableCell>
                <TableCell>{part.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Estimated Total Cost: {currencyConfig.formatAmount(partsList.totalCost)}
      </Typography>

      {partsList.additionalNotes?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Additional Notes:</Typography>
          {partsList.additionalNotes.map((note, index) => (
            <Typography key={index} variant="body2">• {note}</Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

const ChatInterface = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [partsList, setPartsList] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length === 0) {
      setMessages([{ 
        text: questions[0].text,
        sender: 'bot'
      }]);
    }
  }, [messages]);

  // Input validation
  const validateInput = (input) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.validation) {
      return currentQuestion.validation(input);
    }
    return null;
  };

  // Handle service selection
  const handleServiceSelection = async (service) => {
    console.log('Service selected:', service);
    try {
      setSelectedService(service);
      setMessages(prev => [
        ...prev,
        { text: `You've selected: ${service.text}`, sender: 'user' },
        { text: botResponses.paymentPrompt, sender: 'bot', paymentDetails: service }
      ]);
      setAwaitingPayment(true);
    } catch (error) {
      console.error('Service selection error:', error);
      setError('Failed to process service selection');
    }
  };

  // Update the processProjectAnalysis function in ChatInterface.js
const processProjectAnalysis = async (projectData) => {
  console.log('Starting project analysis:', projectData);
  try {
    setIsAnalyzing(true);
    setMessages(prev => [...prev, {
      text: botResponses.analyzing,
      sender: 'bot'
    }]);

    console.log('Sending project data to server');
    // First check if backend is healthy
    try {
      await api.get('/api/health');
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw new Error('Server is unavailable. Please try again in a few minutes.');
    }

    const result = await processProject(projectData);
    console.log('Received analysis result:', result);
    
    if (!result || !result.success) {
      console.error('Invalid server response:', result);
      throw new Error(result?.message || 'Invalid server response');
    }

    setPartsList(result.partsList);
    setAnalysis(result.analysis);
    
    setMessages(prev => [
      ...prev,
      {
        text: botResponses.partsListGenerated,
        sender: 'bot',
        partsList: result.partsList,
        analysis: result.analysis
      },
      {
        text: botResponses.optionsPrompt,
        sender: 'bot',
        showOptions: true
      }
    ]);

    console.log('Storing project data');
    await storeProject({
      ...projectData,
      partsList: result.partsList,
      analysis: result.analysis
    });

    return true;
  } catch (error) {
    console.error('Project analysis failed:', error);
    let errorMessage = 'Failed to analyze project. ';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage += 'Request timed out. The server might be busy, please try again.';
    } else if (error.response?.status === 500) {
      errorMessage += 'Server error. Please try again in a few minutes.';
    } else {
      errorMessage += error.message || 'Please try again.';
    }
    
    setError(errorMessage);
    setMessages(prev => [...prev, {
      text: 'Sorry, ' + errorMessage,
      sender: 'bot'
    }]);
    return false;
  } finally {
    setIsAnalyzing(false);
  }
};

  // Handle payment verification
  const handlePaymentVerification = async (transactionId) => {
    console.log('Verifying payment:', transactionId);
    try {
      const verificationResult = await verifyPayment({ transactionId });
      console.log('Payment verification result:', verificationResult);

      if (!verificationResult.success) {
        throw new Error(verificationResult.message || 'Payment verification failed');
      }

      await updateProjectStatus({
        ...userResponses,
        serviceType: selectedService.id,
        transactionId,
        status: 'PAYMENT_COMPLETED'
      });

      setMessages(prev => [
        ...prev,
        { text: transactionId, sender: 'user' },
        { text: botResponses.paymentConfirmation, sender: 'bot' }
      ]);
      
      setIsComplete(true);
      return true;
    } catch (error) {
      console.error('Payment verification failed:', error);
      setError('Payment verification failed: ' + (error.message || 'Please try again'));
      return false;
    }
  };

  // Main send handler
  const handleSend = async () => {
    if (!input.trim() || isAnalyzing) return;
    setError('');

    console.log('Current state:', {
      questionIndex: currentQuestionIndex,
      awaitingPayment,
      isAnalyzing,
      input: input.trim()
    });

    try {
      // Handle payment confirmation
      if (awaitingPayment) {
        const success = await handlePaymentVerification(input);
        if (success) {
          setInput('');
        }
        return;
      }

      // Handle regular input flow
      const validationError = validateInput(input);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Add user message
      const newMessages = [...messages, { text: input, sender: 'user' }];
      setMessages(newMessages);

      // Update responses
      const currentQuestion = questions[currentQuestionIndex];
      const updatedResponses = {
        ...userResponses,
        [currentQuestion.id]: input
      };
      setUserResponses(updatedResponses);
      setInput('');

      // Handle next step
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: questions[currentQuestionIndex + 1].text,
            sender: 'bot'
          }]);
        }, 500);
      } else if (currentQuestionIndex === questions.length - 1) {
        // All questions answered, process project
        await processProjectAnalysis(updatedResponses);
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  // Render component
  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2, height: 500, overflow: 'auto' }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
                maxWidth: '80%'
              }}
            >
              <Typography>{message.text}</Typography>
              {message.partsList && 
                <PartsListDisplay 
                  partsList={message.partsList} 
                  analysis={message.analysis} 
                />
              }
              {message.showOptions && <ServiceOptions onSelect={handleServiceSelection} />}
              {message.paymentDetails && <PaymentDetails selectedOption={message.paymentDetails} />}
            </Paper>
          </Box>
        ))}
        {isAnalyzing && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            p: 2,
            justifyContent: 'center'
          }}>
            <CircularProgress size={20} />
            <Typography>Analyzing your project...</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            isComplete 
              ? "Chat complete" 
              : awaitingPayment 
                ? "Enter UPI transaction ID" 
                : "Type your message here"
          }
          variant="outlined"
          rows={1}
          sx={{
            '& .MuiInputBase-root': {
              lineHeight: '1.4'
            }
          }}
        />
        <Button
          onClick={handleSend}
          variant="contained"
          sx={{ ml: 1 }}
          disabled={isComplete || isAnalyzing || !input.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;
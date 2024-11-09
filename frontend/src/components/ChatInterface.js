// src/components/ChatInterface.js
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
import api from '../services/api';

// Component for displaying parts list in a table format
const PartsListDisplay = ({ partsList }) => {
  if (!partsList || !partsList.parts) return null;

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>Recommended Parts List:</Typography>
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
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

// Component for displaying service options
const ServiceOptions = ({ onSelect }) => (
  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
    {Object.values(serviceOptions).map((option) => (
      <Card 
        key={option.id} 
        sx={{ 
          flex: 1,
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

// Component for thinking animation
const ThinkingAnimation = () => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 1, 
    p: 2, 
    bgcolor: '#f5f5f5', 
    borderRadius: 1 
  }}>
    <CircularProgress size={20} />
    <Typography variant="body1">
      Analyzing your project...
    </Typography>
  </Box>
);

// Main ChatInterface component
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [partsList, setPartsList] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Show initial greeting
    if (messages.length === 0) {
      setMessages([{ 
        text: questions[0].text,
        sender: 'bot'
      }]);
    }
  }, [messages]);

  // Validate current input
  const validateInput = (input) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.validation) {
      return currentQuestion.validation(input);
    }
    return null;
  };

  // Handle service selection
  const handleServiceSelection = async (service) => {
    setSelectedService(service);
    setMessages(prev => [
      ...prev,
      { text: `You've selected: ${service.text}`, sender: 'user' },
      { text: botResponses.paymentPrompt, sender: 'bot', paymentDetails: service }
    ]);
    setAwaitingPayment(true);
  };

  // Handle payment confirmation
  const handlePaymentConfirmation = async (transactionId) => {
    try {
      // Here you would typically verify the payment with your backend
      await api.verifyPayment(transactionId);
      
      setMessages(prev => [
        ...prev,
        { text: botResponses.paymentConfirmation, sender: 'bot' }
      ]);
      
      // Update project status in sheets
      await api.updateProjectStatus({
        ...userResponses,
        serviceType: selectedService.id,
        transactionId,
        status: 'PAYMENT_COMPLETED'
      });

      setIsComplete(true);
    } catch (error) {
      setError('Failed to verify payment. Please try again or contact support.');
    }
  };

  // Handle message sending
  const handleSend = async () => {
    if (!input.trim() || isAnalyzing) return;
    setError('');

    // If awaiting payment confirmation
    if (awaitingPayment) {
      handlePaymentConfirmation(input);
      setInput('');
      return;
    }

    // Validate input if we're still in the question phase
    if (currentQuestionIndex < questions.length) {
      const validationError = validateInput(input);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Add user's message to chat
    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);

    // Store user's response
    const currentQuestion = questions[currentQuestionIndex];
    const updatedResponses = {
      ...userResponses,
      [currentQuestion.id]: input
    };
    setUserResponses(updatedResponses);
    setInput('');

    // If we're still collecting initial information
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: questions[currentQuestionIndex + 1].text,
          sender: 'bot'
        }]);
      }, 500);
    } 
    // If we've collected all initial information
    else if (currentQuestionIndex === questions.length - 1) {
      setIsAnalyzing(true);
      setMessages(prev => [...prev, {
        text: botResponses.analyzing,
        sender: 'bot',
        isAnalyzing: true
      }]);

      try {
        // Generate parts list and analysis
        const result = await api.processProject(updatedResponses);
        
        if (result.success) {
          setPartsList(result.partsList);
          
          // Show results and service options
          setMessages(prev => [
            ...prev,
            {
              text: botResponses.partsListGenerated,
              sender: 'bot',
              partsList: result.partsList
            },
            {
              text: botResponses.optionsPrompt,
              sender: 'bot',
              showOptions: true
            }
          ]);

          // Store project data
          await api.storeProject({
            ...updatedResponses,
            partsList: result.partsList
          });
        }
      } catch (error) {
        console.error('Error processing project:', error);
        setError('Failed to process your project. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

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
              {message.isAnalyzing && <ThinkingAnimation />}
              {message.partsList && <PartsListDisplay partsList={message.partsList} />}
              {message.showOptions && <ServiceOptions onSelect={handleServiceSelection} />}
              {message.paymentDetails && <PaymentDetails selectedOption={message.paymentDetails} />}
            </Paper>
          </Box>
        ))}
        {isAnalyzing && <ThinkingAnimation />}
        <div ref={messagesEndRef} />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex' }}>
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
          multiline
          maxRows={3}
          disabled={isComplete || isAnalyzing}
        />
        <Button
          onClick={handleSend}
          variant="contained"
          sx={{ ml: 1 }}
          disabled={isComplete || isAnalyzing || !input.trim()}
        >
          {isAnalyzing ? 'Processing...' : 'Send'}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;
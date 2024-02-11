"use client";
import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Flex,
  Stack,
  Box,
  Input,
  Button,
  Text,
  Heading,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { auth, signInWithPhoneNumber } from '../utils/firebase';
import { PhoneAuthProvider, signInWithCredential, RecaptchaVerifier } from 'firebase/auth';

const Home = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal', // Changed from 'invisible' to 'normal'
        callback: (response: any) => {
          console.log('reCAPTCHA verified', response);
        },
      });
      window.recaptchaVerifier.render().catch((error: any) => {
        console.error("Error rendering reCAPTCHA: ", error);
        toast({
          title: "reCAPTCHA error",
          description: "There was an issue rendering the reCAPTCHA. Please try again.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
    }
  }, [toast]);

  // // Invisible recaptcha
  // useEffect(() => {
  //   if (!window.recaptchaVerifier) {
  //     window.recaptchaVerifier = new RecaptchaVerifier(auth, 'request-otp', {
  //       size: 'invisible',
  //       callback: (response: any) => {
  //         // Your callback logic here
  //       },
  //       'expired-callback': () => {
  //         console.log('expired');
  //       },
  //       'error-callback': (error: any) => {
  //         console.log(error);
  //       }
  //     });
  //     window.recaptchaVerifier.render().catch((error: any) => {
  //       console.error("Error rendering reCAPTCHA: ", error);
  //     });
  //   }
  // }, [auth]); 

  const requestOTP = () => {
    const phoneNumberWithCode = "+1" + phoneNumber;
    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, phoneNumberWithCode, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setVerificationId(confirmationResult.verificationId);
        toast({
          title: "OTP Sent",
          description: "Check your phone for the verification code.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }).catch((error) => {
        console.error("SMS not sent", error);
        toast({
          title: "Error",
          description: "Failed to send the OTP. Please try again.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
  };

  const verifyOTP = () => {
    if (!verificationId) return;
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    signInWithCredential(auth, credential).then((result) => {
      console.log("User signed in", result.user);
      toast({
        title: "Signed In",
        description: "You have successfully signed in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }).catch((error) => {
      console.error("User sign in failed", error);
      toast({
        title: "Sign In Failed",
        description: "Failed to sign in. Please check the verification code and try again.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    });
  };

  return (
    <ChakraProvider>
      <Flex direction="column" minHeight="100vh">
        <Flex align={'center'} justify={'center'} bg={'gray.100'}>
          <Stack spacing={8} mx={'auto'} maxW={'lg'} px={6} py={6}>
            <Stack align={'center'}>
              <Heading fontSize={'4xl'} textAlign={'center'}>
                Phone Authentication
              </Heading>
              <Text fontSize={'lg'} textAlign={'center'}>
                Enter your phone number to receive a verification code.
              </Text>
            </Stack>
            <Box rounded={'lg'} bg={'white'} boxShadow={'lg'} p={8}>
              <Stack spacing={4}>
                <FormControl id="phone-number" isRequired>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </FormControl>
                <Button onClick={requestOTP}>Send OTP</Button>
                <FormControl id="verification-code" isRequired>
                  <FormLabel>Verification Code</FormLabel>
                  <Input
                    placeholder="Enter your verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </FormControl>
                <Button onClick={verifyOTP}>Verify OTP</Button>
              </Stack>
              <div id="recaptcha-container"></div>
            </Box>
          </Stack>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
};

export default Home;

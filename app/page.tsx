"use client";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Stack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input as ChakraInput,
  Heading,
  Text,
  ChakraProvider,
  useToast
} from '@chakra-ui/react';
import { 
  useState, 
  useEffect 
} from 'react';
import { 
  createUserWithEmailAndPassword, 
  ConfirmationResult,
  User as FirebaseUser, 
  sendEmailVerification,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
} from 'firebase/firestore';
import { 
  db, 
  auth, 
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from '@/utils/firebase';
import { COLORS } from '../utils/palette';

const { 
  text, 
  secondaryText, 
  background, 
  secondary, 
  grey, 
  buttonCol, 
  primary, 
  accent,
  neonAccent 
} = COLORS;

type User = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
};

export default function Home() {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isOptedIn, setIsOptedIn] = useState(true);
    const [isOptedInTexts, setIsOptedInTexts] = useState(true);
    const [emailSent, setEmailSent] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isAgreed, setIsAgreed] = useState(false);
    const [formError, setFormError] = useState('');
    const [signupSuccessMessage, setSignupSuccessMessage] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const toast = useToast();
    let verify: ConfirmationResult | null = null;

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSignup();
      }
    };
    
    const handleSignup = async () => {
      // Clear previous errors and validations
      setError(null);
      setPasswordError(null);
      setFormError('');
    
      // Basic validation for demonstration purposes
      if (!email || !password || !firstName || !username) {
        setFormError('Please fill in all required fields.');
        return;
      }
        
      try {
        // Create the user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created with email and password", userCredential.user);
    
        // Save user data to Firestore
        const userData = {
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          phoneNumber: phoneNumber, // Make sure to validate or format this as needed
          isOptedIn: isOptedIn,
          isOptedInTexts: isOptedInTexts,
          StageProgress: {
            TilePuzzle: false // Initialize TilePuzzle as false or any other initial state you need
          },
          isAdmin: false // or any other flags you need
        };
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, userData, { merge: true });
        console.log("User data successfully saved to Firestore");
    
        // Send email verification
        await sendEmailVerification(userCredential.user);
        setEmailSent(true);
        setSignupSuccessMessage("Account created successfully. Please check your email for verification.");
    
        // Display a success message or redirect the user to another page
        toast({
          title: 'Account Created Successfully',
          description: 'Please verify your email. You will be redirected to the profile page. Verify your email and refresh the page',
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } catch (error) {
        if (error instanceof Error) {
          // Handle specific Firebase errors (e.g., weak password, email already in use)
          console.error("Error during signup process", error);
          setError(error.message || "An unknown error occurred during signup.");
        } else {
          setError("An unknown error occurred during signup.");
        }
      }
    };

    // Invisible recaptcha
    useEffect(() => {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'request-otp', {
          size: 'invisible',
          callback: (response: any) => {
            // Your callback logic here
          },
          'expired-callback': () => {
            console.log('expired');
          },
          'error-callback': (error: any) => {
            console.log(error);
          }
        });
        window.recaptchaVerifier.render().catch((error: any) => {
          console.error("Error rendering reCAPTCHA: ", error);
        });
      }
    }, [auth]); 

    const sendVerificationCode = (phoneNumber: string) => {
      // Assuming 'auth' is correctly initialized Firebase Auth instance
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          // handle the verification
        },
      });
    
      signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
        .then((confirmationResult: ConfirmationResult) => {
          // SMS sent. Prompt user to enter the code
          verify = confirmationResult;
          setIsModalOpen(true); // Show the modal for code input
        }).catch((error: Error) => {
          // Handle errors here
          setError(error.message);
        });
    };

    async function handleFinalizeSignup() {
      // Assuming user's email and password sign-up has been initiated before and you're finalizing the signup process here
      try {
        // You might save additional user info to Firestore, send a welcome email, or redirect the user to a different page
        console.log("Signup finalized");
    
        // Redirect or show a success message
        toast({
          title: 'Signup Complete',
          description: 'Your account has been successfully created.',
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
    
        // Redirect the user or update the UI to reflect the successful signup
      } catch (error) {
        console.error("Failed to finalize signup", error);
        setError("Failed to finalize the signup process.");
      }
    };

    const verifyCodeAndSignup = async (code: string) => {
      try {
        if (!verify) {
          throw new Error("Verification process not initialized.");
        }
        const result = await verify.confirm(code);
        console.log("SMS verification successful", result);
    
        // Proceed with finalizing the signup process
        handleFinalizeSignup();
      } catch (error) {
        console.error("Failed to verify the SMS code.", error);
        setError("Failed to verify the SMS code.");
      }
    };    
    
    return (
      <ChakraProvider>
        <link href="https://fonts.googleapis.com/css2?family=Kdam+Thmor+Pro&display=swap" rel="stylesheet" />
         
      <Flex
        align={'center'}
        justify={'center'}
        pb="50px"
        bg={background}
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat',
          width: '100vw', 
          maxWidth: '100%',
          minHeight: '100vh',
          overflowX: 'hidden', 
        }}
      >

          <Stack spacing={8} mx={'auto'} maxW={'lg'} px={6} py={6}>
            <Stack align={'center'}>
              <Heading fontSize={'4xl'} textAlign={'center'} color={text} fontFamily="'Kdam Thmor Pro', sans-serif">
                SIGN UP
              </Heading>
              <Text fontSize={'lg'} color={text} align={'center'} fontFamily="'Kdam Thmor Pro', sans-serif">
                With email and or phone number
              </Text>
            </Stack>
            <Box
              rounded={'lg'}
              boxShadow={'lg'}
              p={9}
              bg={secondary}
              borderColor={primary}
              borderWidth="3px"
              minWidth={"350px"}
            >
              <Stack spacing={4}>
                {/* Username field added here */}
                <FormControl id="username" isRequired>
                    <FormLabel color={secondaryText} fontFamily="'Kdam Thmor Pro', sans-serif">Username</FormLabel>
                    <Input 
                      fontFamily="'Kdam Thmor Pro', sans-serif"
                      bg={background} 
                      placeholder="Create a username"
                      sx={{
                          '::placeholder': {
                          color: 'gray.400', 
                          },
                      }}
                      _hover={{ borderColor: primary, borderWidth: "2px" }}
                      color={text}
                      _focus={{ borderColor: accent, borderWidth: '3px' }}
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      type="text" 
                      onKeyDown={handleKeyPress}
                      borderColor="black"
                    />
                </FormControl>

                <HStack>
                  <Box>
                    <FormControl id="firstName" isRequired>
                      <FormLabel color={secondaryText} fontFamily="'Kdam Thmor Pro', sans-serif">First Name</FormLabel>
                      <Input 
                        fontFamily="'Kdam Thmor Pro', sans-serif"
                        bg={background} 
                        placeholder="Enter your first name"
                        sx={{
                            '::placeholder': {
                            color: 'gray.400', 
                            },
                        }}
                        color={text}
                        _focus={{ borderColor: accent, borderWidth: '3px' }}
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} type="text" 
                        onKeyDown={handleKeyPress}
                        borderColor="black"
                        _hover={{ borderColor: primary, borderWidth: "2px" }}
                      />
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl id="lastName" >
                      <FormLabel color={secondaryText} fontFamily="'Kdam Thmor Pro', sans-serif">Last Name</FormLabel>
                      <Input 
                        fontFamily="'Kdam Thmor Pro', sans-serif"
                        bg={background} 
                        placeholder="Enter your last name"
                        sx={{
                            '::placeholder': {
                            color: 'gray.400', 
                            },
                        }}
                        color={text}
                        _hover={{ borderColor: primary, borderWidth: "2px" }}
                        _focus={{ borderColor: accent, borderWidth: '3px' }}
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} type="text" 
                        onKeyDown={handleKeyPress}
                        borderColor="black"
                      />
                    </FormControl>
                  </Box>
                </HStack>

                <FormControl id="email" isRequired>
                  <FormLabel color={secondaryText} fontFamily="'Kdam Thmor Pro', sans-serif">Email address</FormLabel>
                  <Input 
                    fontFamily="'Kdam Thmor Pro', sans-serif"
                    bg={background} 
                    placeholder="example@obscurity.net"
                    sx={{
                        '::placeholder': {
                        color: 'gray.400', 
                        },
                    }}
                    color={text}
                    _hover={{ borderColor: primary, borderWidth: "2px" }}
                    _focus={{ borderColor: accent, borderWidth: '3px' }}
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                    type="text" 
                    onKeyDown={handleKeyPress}
                    borderColor="black"
                  />
                </FormControl>

                <FormControl id="phone">
                  <Flex align="center">
                    <FormLabel color={secondaryText} fontFamily="'Kdam Thmor Pro', sans-serif">Phone Number</FormLabel>
                  </Flex>
                  <Input 
                    fontFamily="'Kdam Thmor Pro', sans-serif"
                    bg={background} 
                    placeholder="(555) 123-4567"
                    sx={{
                      '::placeholder': {
                        color: 'gray.400', 
                      },
                    }}
                    color={text}
                    _hover={{ borderColor: primary, borderWidth: "2px" }}
                    _focus={{ borderColor: accent, borderWidth: '3px' }}
                    value={phoneNumber} 
                    // type="tel" 
                    onKeyDown={handleKeyPress}
                    borderColor="black"
                  />
                </FormControl>

                <div id="recaptcha-container"></div>
                <div id="request-otp"></div>
                
                <FormControl id="password" isRequired>
                  <Flex align="center">
                    <FormLabel color={secondaryText} fontFamily="'Kdam Thmor Pro', sans-serif">Password</FormLabel>
                  </Flex>
                    <Input 
                      fontFamily="'Kdam Thmor Pro', sans-serif"
                      bg={background} 
                      placeholder="Enter a 5tR0ng-pV55vv0rd"
                      sx={{
                          '::placeholder': {
                          color: 'gray.400', 
                          },
                      }}
                      color={text}
                      _hover={{ borderColor: primary, borderWidth: "2px" }}
                      _focus={{ borderColor: accent, borderWidth: '3px' }}
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      onKeyDown={handleKeyPress}
                      borderColor="black"
                    />
                </FormControl>
                
                <Stack spacing={10} pt={2}>
                {emailSent && (
                    <Text color="green" fontFamily="'Kdam Thmor Pro', sans-serif">
                        Success! A verification email has been sent. Please check your inbox and verify your address to log in.
                    </Text>
                )}
                
                {formError && <Text color="red.500">{formError}</Text>}
                {error && <Text color="red.500">{error}</Text>}

                  <Button
                      fontFamily="'Kdam Thmor Pro', sans-serif"
                      onClick={handleSignup}
                      loadingText="Submitting"
                      size="lg"
                      color={secondaryText}
                      _hover={{ 
                        bg: `${accent}80`, 
                        transform: 'scale(1.05)' 
                      }}
                      _active={{ 
                        bg: `${neonAccent}80` 
                      }}
                      boxShadow="0px 4px 10px rgba(0, 0, 0, 0.2)" 
                      border="2px solid"
                      backgroundColor={`${buttonCol}80`}
                      borderColor={grey} 
                      transition="all 0.3s ease-in-out" 
                      style={{ borderRadius: '20px' }}
                    >
                      Sign Up
                  </Button>
                  <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Enter Verification Code</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        <FormControl id="verification-code" isRequired>
                          <FormLabel>Verification Code</FormLabel>
                          <ChakraInput
                            placeholder="123456"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                          />
                        </FormControl>
                      </ModalBody>
                      <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={() => verifyCodeAndSignup(verificationCode)}>
                          Verify
                        </Button>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                </Stack>
              </Stack>
            </Box>
          </Stack>
      </Flex>
    </ChakraProvider>
  );
}


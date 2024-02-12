"use client";
import {
  Flex,
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  Link as ChakraLink,
  ChakraProvider,
  Tooltip,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  Center,
  useToast
} from '@chakra-ui/react';
import { 
  BsInfoSquare, 
} from 'react-icons/bs'; 
import Link from 'next/link';
import { 
  useState, 
  useEffect 
} from 'react';
import { 
  ViewIcon, 
  ViewOffIcon 
} from '@chakra-ui/icons';
import dynamic from "next/dynamic";
import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  User as FirebaseUser, 
  sendEmailVerification,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { 
  db, 
  auth, 
  collection, 
  getDocs, 
  query, 
  where,
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
    const toast = useToast();
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSignup();
      }
    };
    
    const handleSignup = async () => {
      // Clear previous errors and validations
      setError(null);
      setFormError('');
      setPasswordError(null);
    };

    const handleFinalizeSignup = async () => {
      if (!isAgreed) {
        toast({
            title: "Terms of Service",
            description: "You must agree to the Terms of Service to sign up.",
            status: "error",
            duration: 9000,
            isClosable: true,
        });
        return;
      }

      try {
        // Create the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created with email and password", userCredential.user);
    
        // Save user data to Firestore
        const userData = {
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          phoneNumber: phoneNumber,
          isOptedIn: isOptedIn,
          isOptedInTexts: isOptedInTexts,
          StageProgress: {
            TilePuzzle: false // Initialize TilePuzzle as false
          },
          isAdmin: false 
        };
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, userData, { merge: true });
        console.log("User data successfully saved to Firestore");
    
        // Send email verification
        await sendEmailVerification(userCredential.user);
        setEmailSent(true);
        setSignupSuccessMessage("Account created successfully. Please check your email for verification.");
    
        // Display a combined toast message for account creation and email verification
        toast({
          title: 'Account Created Successfully',
          description: 'Please verify your email. You will be redirected to the profile page. Verify your email and refresh the page',
          status: 'success',
          duration: 15000,
          isClosable: true,
        });

      } catch (error) {
        if (error instanceof Error) {
          // Handle errors
          console.error("Error during signup process", error);
          setError(error.message || "An unknown error occurred during signup.");
        } else { 
          setError("An unknown error occurred during signup.");
        }
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
                    <FormLabel color={secondaryText} fontFamily="'Kdam Thmor Pro', sans-serif">Phone Number (Optional)</FormLabel>
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
                    type="tel" 
                    onKeyDown={handleKeyPress}
                    borderColor="black"
                  />
                </FormControl>

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
                </Stack>
              </Stack>
            </Box>
          </Stack>
      </Flex>
    </ChakraProvider>
  );
}


import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Button,
    Heading,
    Text,
    ChakraProvider,
    InputGroup,
    InputRightElement,
    useToast
} from '@chakra-ui/react';
import { 
    ViewIcon, 
    ViewOffIcon 
} from '@chakra-ui/icons';
import { 
    useState, 
    useEffect 
} from 'react';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    auth, 
} from '@/utils/firebase';
import dynamic from "next/dynamic";
import { COLORS } from '@/utils/palette';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/utils/firebase'; 

const { 
  text, 
  secondaryText, 
  background, 
  secondary, 
  buttonCol, 
  primary, 
  accent,
  grey 
} = COLORS;

interface FindUserResponse {
  email: string;
}

const functions = getFunctions(firebaseApp); 

    
function Login() {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState<string | null>(null);

    const toast = useToast();

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleLogin();
      }
    };
  
    const handleLogin = async () => {
      let resolvedEmail = emailOrUsername; // Default to using the input as email
    
      // If the input is not an email, try to resolve it via the cloud function
      if (!emailOrUsername.includes('@')) {
        const findUserByEmailOrUsername = httpsCallable<{ loginIdentifier: string }, FindUserResponse>(functions, 'findUserByEmailOrUsername');
        try {
          const result = await findUserByEmailOrUsername({ loginIdentifier: emailOrUsername });
          resolvedEmail = result.data.email; // Correctly reassign the resolved email
        } catch (error) {
          console.error('Error finding user:', error);
          toast({
            title: 'Error',
            description: 'Could not find user by username.',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
          return;
        }
      }
    
      // Proceed with authentication using resolved email
      try {
        await signInWithEmailAndPassword(auth, resolvedEmail, password);
        // Navigate to dashboard or home page on successful login
        window.location.href = '/';
      } catch (error) {
        console.error('Login error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Invalid credentials. Please try again.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    };
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && localStorage.getItem('rememberMe') === 'true') {
          console.log('User is signed in:', user);
          window.location.href = '/auth/Profile'; 
        } else {
          console.log('User is logged out or not remembered');
        }
      });
  
      return () => unsubscribe();
    }, []);
  
    return (
      <ChakraProvider>
        <Flex direction="column" minHeight="100vh" style={{ borderBottom: 'solid rgba(168, 186, 203, 1.0)' }}>
        <Flex
          align={'center'}
          justify={'center'}
          pb="150px"
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
                  Log In
                </Heading>
                <Text textAlign={'center'} fontSize={'lg'} color={text} fontFamily="'Kdam Thmor Pro', sans-serif">
                  Log in as an admin (recommended) if your rules restrict users from listing document data.
                </Text>
              </Stack>
              <Box
                rounded={'lg'}
                boxShadow={'lg'}
                p={9}
                bg={secondary}
                w={'32vw'}
                alignSelf={'center'}
                borderColor={primary}
                borderWidth="3px"
                minWidth={"350px"}
              >
                <Stack spacing={4}>
                  <FormControl id="email" isRequired>
                    <FormLabel color={secondaryText} fontFamily="'Kdam Thmor Pro', sans-serif">Username or Email Address</FormLabel>
                    <Input
                      placeholder="Enter your username or email"
                      sx={{
                          '::placeholder': {
                          color: 'gray.400', 
                          },
                      }}
                      bg={background}
                      color={text}
                      _hover={{ borderColor: primary, borderWidth: "2px" }}
                      _focus={{ borderColor: accent, borderWidth: '3px' }}
                      value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)}
                      type="email"
                      onKeyDown={handleKeyPress}
                      borderColor="black"
                      fontFamily="'Kdam Thmor Pro', sans-serif"
                    />
                  </FormControl> 
  
                  <FormControl id="password" isRequired>
                    <FormLabel color={secondaryText} fontFamily="'Kdam Thmor Pro', sans-serif">Password</FormLabel>
                    <InputGroup>
                      <Input 
                        fontFamily="'Kdam Thmor Pro', sans-serif"
                        bg={background} 
                        color={text}
                        placeholder="Enter your password"
                        _hover={{ borderColor: primary, borderWidth: "2px" }}
                        _focus={{ borderColor: accent, borderWidth: '3px' }}
                        sx={{
                            '::placeholder': {
                            color: 'gray.400', 
                            },
                        }}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        type={showPassword ? "text" : "password"} 
                        onKeyDown={handleKeyPress}
                        borderColor="black"
                      />
                      <InputRightElement h={'full'}>
                        <Button
                          color={secondary}
                          variant={'ghost'}
                          _hover={{ borderColor: primary, borderWidth: "2px" }}
                          onClick={() => setShowPassword((showPassword) => !showPassword)}>
                          {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    {passwordError && <Text color="red.500">{passwordError}</Text>} {/* Show password error here */}
                  </FormControl>
  
                  <Stack spacing={10}>
  
                    {error && <Text textAlign='center' color="red.500">{error}</Text>}
                    <Flex justifyContent="center" mt={4}>
                      <Button
                        onClick={handleLogin}
                        loadingText="Submitting"
                        size="lg"
                        color={secondaryText}
                        _hover={{
                          bg: `${accent}80`,
                          transform: 'scale(1.05)'
                        }}
                        _active={{
                          bg: `${accent}80`
                        }}
                        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.2)"
                        border="2px solid"
                        borderColor={grey}
                        backgroundColor={`${buttonCol}80`}
                        transition="all 0.3s ease-in-out"
                        style={{ borderRadius: '20px' }}
                        w="10vw"
                        minW="150px"
                        fontFamily="'Kdam Thmor Pro', sans-serif"
                      >
                        Log In
                      </Button>
                    </Flex>

                  </Stack>
                </Stack>
              </Box>
            </Stack>
        </Flex>
        </Flex>
      </ChakraProvider>
    );
  }
  
  export default dynamic(() => Promise.resolve(Login), { ssr: false });

    
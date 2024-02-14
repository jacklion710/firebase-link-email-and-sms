import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Stack,
  ChakraProvider,
} from '@chakra-ui/react';
import { auth } from '../utils/firebase'
import { getAuth } from 'firebase/auth';

interface UserProviderData {
    providerId: string;
    uid: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
}

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState<UserProviderData[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const userData = user.providerData.map((profile) => ({
          providerId: profile.providerId,
          uid: profile.uid,
          name: profile.displayName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
        }));
        setUserInfo(userData);
      }
    });
  
    // Clean up the observer
    return () => unsubscribe();
  }, []);

  return (
    <ChakraProvider>
      <Flex align={'center'} justify={'center'} pb="50px" minH="100vh">
        <Stack spacing={8} mx={'auto'} maxW={'lg'} px={6} py={6}>
          <Stack align={'center'}>
            <Heading fontSize={'4xl'} textAlign={'center'}>
              User Profile
            </Heading>
            <Text fontSize={'lg'} color={'gray.600'} align={'center'}>
              Authentication Methods and Details
            </Text>
          </Stack>
          <Box rounded={'lg'} boxShadow={'lg'} p={8}>
            {userInfo.length > 0 ? (
              userInfo.map((info, index) => (
                <Box key={index} p={5} shadow="md" borderWidth="1px" mb={4}>
                  <Text fontWeight="bold">Provider: {info.providerId}</Text>
                  <Text>Name: {info.name || 'N/A'}</Text>
                  <Text>Email: {info.email || 'N/A'}</Text>
                  <Text>Phone: {info.phoneNumber || 'N/A'}</Text>
                </Box>
              ))
            ) : (
              <Text>No user information available.</Text>
            )}
          </Box>
        </Stack>
      </Flex>
    </ChakraProvider>
  );
};

export default UserProfile;

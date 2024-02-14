"use client";
import { ChakraProvider} from '@chakra-ui/react';
import Signup from '@/pages/Signup'; 

export default function Home() {
    
    return (
      <ChakraProvider>
        <Signup />
      </ChakraProvider>
  );
}


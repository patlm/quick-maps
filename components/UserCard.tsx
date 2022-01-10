import {
    Avatar,
    Flex,
    Heading,
    Link,
    Stack,
    useColorModeValue,
} from '@chakra-ui/react';
import { FC } from 'react';
import { User } from '../models/user';

type UserCardProps = {
    user: User;
};

// Modified Social Profile with Image Horizontal: https://chakra-templates.dev/components/cards
export const UserCard: FC<UserCardProps> = (props) => {
    return (
        <Link
            href={`/maps?userId=${props.user.uid}`}
            display={'inline-block'}
            m={'15px'}
        >
            <Stack
                borderWidth='1px'
                borderRadius='lg'
                w={'400px'}
                height={'100px'}
                direction={{ base: 'column', md: 'row' }}
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow={'2xl'}
                padding={4}
            >
                <Flex flex={1}>
                    <Avatar size={'lg'} src={props.user.photoURL} />
                </Flex>
                <Stack
                    flex={3}
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    p={1}
                    pt={2}
                >
                    <Heading fontSize={'2xl'} fontFamily={'body'}>
                        {props.user.displayName}
                    </Heading>
                </Stack>
            </Stack>
        </Link>
    );
};

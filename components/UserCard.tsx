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
                minW={'325'}
                height={'85px'}
                direction={{ base: 'row', md: 'row' }}
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow={'xl'}
                padding={4}
            >
                <Flex>
                    <Avatar size={'md'} src={props.user.photoURL} />
                </Flex>
                <Stack
                    flexDirection='row'
                    justifyContent='left'
                    alignItems='center'
                    p={1}
                >
                    <Heading fontSize={'xl'} fontFamily={'body'} ml={15}>
                        {props.user.displayName}
                    </Heading>
                </Stack>
            </Stack>
        </Link>
    );
};

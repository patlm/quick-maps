import {
    Avatar,
    Box,
    Heading,
    Link,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import { Map } from '../models/map';
import { User } from '../models/user';

type MapCardProps = {
    map: Map;
};

// Modified Blog Post with Image: https://chakra-templates.dev/components/cards
export const MapCard: FC<MapCardProps> = (props) => {
    const [user, setUser] = useState<User>({
        displayName: 'John Doe',
        photoURL: '/face_black_24dp.svg',
        maps: [],
        uid: '',
    });

    useEffect(() => {
        fetch(`api/users/${props.map.creator}`)
            .then((response) => response.json())
            .then((response) => {
                const u = response as User;
                setUser(u);
            });
    }, []);

    return (
        <Link
            href={`/maps/${props.map.id}`}
            display={'inline-block'}
            w={'400px'}
            margin={'15px'}
        >
            <Box
                maxW={'400px'}
                w={'full'}
                bg={useColorModeValue('white', 'gray.900')}
                boxShadow={'2xl'}
                rounded={'md'}
                p={6}
            >
                <Box
                    h={'210px'}
                    bg={'gray.100'}
                    mt={-6}
                    mx={-6}
                    mb={6}
                    pos={'relative'}
                >
                    <Image src={props.map.resource} layout={'fill'} />
                </Box>
                <Stack>
                    <Heading
                        color={useColorModeValue('gray.700', 'white')}
                        fontSize={'2xl'}
                        fontFamily={'body'}
                    >
                        {props.map.name}
                    </Heading>
                    <Text color={'gray.500'}>{props.map.description}</Text>
                </Stack>
                <Stack mt={6} direction={'row'} spacing={4} align={'center'}>
                    <Avatar src={user.photoURL} alt={'Author'} />
                    <Stack direction={'column'} spacing={0} fontSize={'sm'}>
                        <Text fontWeight={600}>{user.displayName}</Text>
                    </Stack>
                </Stack>
            </Box>
        </Link>
    );
};

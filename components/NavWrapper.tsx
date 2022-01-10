import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import {
    Avatar,
    Box,
    Button,
    Flex,
    HStack,
    IconButton,
    Link,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Stack,
    Text,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
} from 'firebase/auth';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { fireClientConfig } from '../lib/fireConfig';
import { User as MyUser } from '../models/user';

type Link = {
    name: string;
    href: string;
};

const Links: Link[] = [
    { name: 'Home', href: '/' },
    { name: 'Maps', href: '/maps' },
    { name: 'Creators', href: '/creators' },
    { name: 'Create', href: '/create' },
];

type NavLinkProps = {
    href: string;
};

const NavLink: FC<NavLinkProps> = (props) => (
    <Link
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
            textDecoration: 'none',
            bg: useColorModeValue('gray.200', 'gray.700'),
        }}
        href={props.href}
    >
        {props.children}
    </Link>
);

type NavWrapperProps = {};

export const NavWrapper: FC<NavWrapperProps> = (props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();

    const [user, setUser] = useState<User | null>();

    const photoURL = '/account_circle_black_24dp.svg';

    const onSignIn = () => {
        const auth = getAuth();

        signInWithPopup(auth, new GoogleAuthProvider()).then((credentials) => {
            const user: MyUser = {
                uid: credentials.user.uid,
                displayName: credentials.user.displayName || '',
                photoURL: credentials.user.photoURL || '/face_black_24dp.svg',
                maps: [],
            };

            const reqOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            };

            fetch('/api/users', reqOptions)
                .then((response) => response.json())
                .then((_) => {
                    // request data returned
                });
        });
    };

    const onSignOut = () => {
        signOut(getAuth());
    };

    useEffect(() => {
        initializeApp(fireClientConfig);

        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(user);
            }
        });
    }, []);

    return (
        <>
            <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
                <Flex
                    h={16}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                >
                    <IconButton
                        size={'md'}
                        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                        aria-label={'Open Menu'}
                        display={{ md: 'none' }}
                        onClick={isOpen ? onClose : onOpen}
                    />
                    <HStack spacing={8} alignItems={'center'}>
                        <Box color={'blue'}>quick-maps</Box>
                        <HStack
                            as={'nav'}
                            spacing={4}
                            display={{ base: 'none', md: 'flex' }}
                        >
                            {Links.map((link) => (
                                <NavLink key={link.name} href={link.href}>
                                    {link.name}
                                </NavLink>
                            ))}
                        </HStack>
                    </HStack>
                    <Flex alignItems={'center'}>
                        {/* Solution to prevent error with ids not being consistent between server and client https://giters.com/chakra-ui/chakra-ui/issues/4328 */}
                        <Menu isLazy id={'menu-id'}>
                            <MenuButton
                                as={Button}
                                rounded={'full'}
                                variant={'link'}
                                cursor={'pointer'}
                                minW={0}
                            >
                                <Avatar
                                    size={'sm'}
                                    src={
                                        user?.photoURL
                                            ? user.photoURL
                                            : photoURL
                                    }
                                />
                            </MenuButton>
                            <MenuList>
                                {user ? (
                                    <>
                                        <MenuItem
                                            onClick={() => {
                                                router.push({
                                                    pathname: '/maps',
                                                    query: { userId: user.uid },
                                                });
                                            }}
                                        >
                                            Profile
                                        </MenuItem>
                                        <MenuDivider />
                                        <MenuItem onClick={onSignOut}>
                                            Sign out
                                        </MenuItem>
                                    </>
                                ) : (
                                    <MenuItem onClick={onSignIn}>
                                        Sign in
                                    </MenuItem>
                                )}
                            </MenuList>
                        </Menu>
                    </Flex>
                </Flex>

                {isOpen ? (
                    <Box pb={4} display={{ md: 'none' }}>
                        <Stack as={'nav'} spacing={4}>
                            {Links.map((link) => (
                                <NavLink key={link.name} href={link.href}>
                                    {link.name}
                                </NavLink>
                            ))}
                        </Stack>
                    </Box>
                ) : null}
            </Box>

            <Box p={4} minH='90vh'>
                {props.children}
            </Box>
            <Box align={'center'} marginBottom={'15px'}>
                <Text>
                    quick-maps created by{' '}
                    <Link href='https://patlm.github.io/'>Patrick</Link> &copy;
                    2022
                </Text>
            </Box>
        </>
    );
};

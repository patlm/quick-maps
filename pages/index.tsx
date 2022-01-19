import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import type { NextPage } from 'next';
import { NavWrapper } from '../components/NavWrapper';
import { User } from '../models/user';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
    const onSignIn = () => {
        const auth = getAuth();

        signInWithPopup(auth, new GoogleAuthProvider()).then((credentials) => {
            const user: User = {
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

    return (
        <NavWrapper>
            <div className={styles.container}>
                <main className={styles.main}>
                    <Box alignSelf={'center'} display={'block'} mb={'40px'}>
                        <Heading
                            justifyContent={'center'}
                            alignSelf={'center'}
                            fontWeight={'normal'}
                            size={'2xl'}
                        >
                            Welcome to{' '}
                            <Flex color={'blue'} display={'inline'}>
                                quick-maps!
                            </Flex>
                        </Heading>
                    </Box>

                    <div className={styles.grid}>
                        <a href='/maps' className={styles.card}>
                            <Heading fontWeight={'normal'}>
                                Test your skills &rarr;
                            </Heading>
                            <Text>
                                Check out the collection of existing maps
                                available for you to play.
                            </Text>
                            <img src='/map-card.png' />
                        </a>

                        <a href='/creators' className={styles.card}>
                            <Heading fontWeight={'normal'}>
                                Find creators &rarr;
                            </Heading>
                            <Text>
                                Find maps created by your favorite creators.
                            </Text>
                            <img src='/creator-cards.png' />
                        </a>

                        <a href='/create' className={styles.card}>
                            <Heading fontWeight={'normal'}>
                                Create map &rarr;
                            </Heading>
                            <Text>
                                Create your own maps to learn from based on a
                                selection of preloaded maps.
                            </Text>
                            <img src='/create-world.png' />
                        </a>

                        <a onClick={onSignIn} className={styles.card}>
                            <Heading fontWeight={'normal'}>
                                Create account &rarr;
                            </Heading>
                            <Text>
                                Create an account to save your scores and create
                                your own maps.
                            </Text>
                            <img src='/create-account.png' />
                        </a>
                    </div>
                </main>
            </div>
        </NavWrapper>
    );
};

export default Home;

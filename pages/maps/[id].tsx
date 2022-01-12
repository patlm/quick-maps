import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Flex,
    Text,
} from '@chakra-ui/react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Map as MapComponent } from '../../components/Map';
import { NavWrapper } from '../../components/NavWrapper';
import { fireClientConfig } from '../../lib/fireConfig';
import { LeaderboardEntry } from '../../models/leaderboardEntry';
import { Map } from '../../models/map';
import { Marker as MyMarker } from '../../models/marker';

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array: Object[]) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

const Map: NextPage = () => {
    const router = useRouter();
    const { id: mapId } = router.query;

    const [map, setMap] = useState<Map>({
        creator: '',
        description: '',
        id: typeof mapId === 'string' ? mapId : '',
        name: '',
        resource: '',
        markers: [],
    });

    const [user, setUser] = useState<User | null>();
    const [time, setTime] = useState(0);
    const [findLocal, setFindLocal] = useState('');
    const [locals, setLocals] = useState<MyMarker[]>([]);
    const [isCA, setIsCA] = useState<boolean>(false);
    const [isWA, setIsWA] = useState<boolean>(false);
    const [started, setStarted] = useState<boolean>(false);
    const [_, setInt] = useState<NodeJS.Timer>();
    const [isDeleteHidden, setIsDeleteHidden] = useState(true);

    let [incorrectCount, setIncorrectCount] = useState(0);
    let [correctCount, setCorrectCount] = useState(0);

    useEffect(() => {
        if (mapId) {
            fetch(`/api/maps/${mapId}`)
                .then((response) => response.json())
                .then((response) => {
                    const map = response as Map;
                    setMap(map);
                });
        }
    }, [router]);

    useEffect(() => {
        if (locals.length > 0) {
            setFindLocal(locals[0].name);
        } else if (started) {
            // Stop the game
            setStarted(false);
            setInt((prevInt) => {
                if (prevInt) {
                    clearInterval(prevInt);
                }
                return prevInt;
            });

            // Push scores to firebase
            let leaderboardEntry: LeaderboardEntry = {
                id: '',
                incorrect: incorrectCount,
                player: 'Guest',
                score: 1000 - time - incorrectCount * 25,
                time: time,
            };

            if (user) {
                leaderboardEntry.player = user.displayName!;
            }

            const reqOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leaderboardEntry),
            };

            fetch(`/api/maps/${mapId}/scores`, reqOptions)
                .then((response) => response.json())
                .then((data) => {
                    // Navigate away
                    router.push({
                        pathname: `/maps/${mapId}/leaderboard`,
                        query: { leaderboardEntryId: data.id },
                    });
                });
        }
    }, [locals]);

    useEffect(() => {
        initializeApp(fireClientConfig);

        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(user);
                setIsDeleteHidden(true);
            }
        });
    }, []);

    useEffect(() => {
        if (user && user.uid === map.creator) {
            setIsDeleteHidden(false);
        }
    }, [map]);

    const onStart = (): void => {
        if (!started) {
            // Generate randomly ordered list of locations to show
            map.markers.forEach((m, i) => {
                setLocals((prevLocals) => [...prevLocals, m]);
            });

            setLocals((prevLocals) => {
                shuffle(prevLocals);
                return prevLocals;
            });

            setStarted(true);
            setInt(
                setInterval(() => setTime((prevTime) => prevTime + 1), 1000)
            );
        } else {
            // Navigate away
            setInt((prevInterval) => {
                if (prevInterval) {
                    clearInterval(prevInterval);
                }
                return prevInterval;
            });
            router.push({
                pathname: `/maps/${mapId}/leaderboard`,
                query: { leaderboardEntryId: 'incomplete' },
            });
        }
    };

    const makeGuess = (guessedValue: string, setCorrect: () => void): void => {
        if (!started) {
            return;
        }

        const choice = guessedValue;

        const ca = choice === findLocal;
        setIsCA(ca);
        setIsWA(!ca);

        if (ca) {
            setCorrectCount((prev) => prev + 1);
            setLocals((prevLocals) => {
                return prevLocals.slice(1);
            });
            setCorrect();
        } else {
            setIncorrectCount((prev) => prev + 1);
        }
    };

    const [isOpen, setIsOpen] = React.useState(false);
    const onClose = () => setIsOpen(false);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    const handleDelete = () => {
        console.log('delete');

        const reqOptions = {
            method: 'DELETE',
        };

        fetch(`/api/maps/${map.id}`, reqOptions)
            .then((result) => result.json())
            .then((result) => {
                console.log('result');
                router.push({
                    pathname: `/maps`,
                    query: { userId: user?.uid },
                });
            });
    };

    return (
        <NavWrapper>
            <Box>
                <Flex p={2}>
                    <Button onClick={onStart} ml={25}>
                        {!started ? 'Start' : 'End'}
                    </Button>
                    <Text mt={2} ml={25}>
                        Time: {time} seconds
                    </Text>
                    <Text mt={2} ml={25}>
                        Find: {findLocal}
                    </Text>
                    {isCA && (
                        <Text mt={2} ml={25} color='green'>
                            Correct!
                        </Text>
                    )}
                    {isWA && (
                        <Text mt={2} ml={25} color='red'>
                            Wrong!
                        </Text>
                    )}
                </Flex>
            </Box>
            <MapComponent
                src={map.resource}
                markers={map.markers}
                onClick={makeGuess}
                showTitle={false}
            />
            <Button
                hidden={isDeleteHidden}
                colorScheme={'red'}
                onClick={() => setIsOpen(true)}
            >
                Delete Map
            </Button>
            <Button
                ml={1}
                hidden={isDeleteHidden}
                onClick={() =>
                    router.push({ pathname: '/create', query: { edit: mapId } })
                }
            >
                Edit Map
            </Button>
            <>
                <AlertDialog
                    isOpen={isOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onClose}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                Delete Map
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                Are you sure? You can't undo this action
                                afterwards.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme='red'
                                    onClick={handleDelete}
                                    ml={3}
                                >
                                    Delete
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </>
        </NavWrapper>
    );
};

export default Map;

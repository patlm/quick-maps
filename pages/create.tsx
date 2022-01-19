import {
    Box,
    Button,
    Flex,
    Input,
    Link,
    Select,
    Text,
    Textarea,
    useToast,
} from '@chakra-ui/react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { NextPage } from 'next';
import Router, { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { Map as MapComponent } from '../components/Map';
import { NavWrapper } from '../components/NavWrapper';
import { fireClientConfig } from '../lib/fireConfig';
import { Map } from '../models/map';
import { Marker } from '../models/marker';

const Maps: NextPage = () => {
    const maps = [
        {
            value: '/africa-blank-map.png',
            label: 'Africa Blank Map',
        },
        {
            value: '/asia-blank-map.png',
            label: 'Asia Blank Map',
        },
        {
            value: '/europe-blank-map.png',
            label: 'Europe Blank Map',
        },
        {
            value: '/nebraska-blank-map.png',
            label: 'Nebraska Blank Map',
        },
        {
            value: '/north-america-blank-map.png',
            label: 'North America Blank Map',
        },
        {
            value: '/oceanic-blank-map.png',
            label: 'Oceanic Blank Map',
        },
        {
            value: '/south-america-blank-map.png',
            label: 'South America Blank Map',
        },
        {
            value: '/south-america-blank-map-2.png',
            label: 'South America Blank Map 2',
        },
        {
            value: '/us-blank-map.jpg',
            label: 'U.S. Blank Map',
        },
        {
            value: '/world-blank-map.png',
            label: 'World Blank Map',
        },
    ];

    const router = useRouter();
    const toast = useToast();

    const imageRef = useRef<HTMLImageElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const nameValueRef = useRef<HTMLDivElement>(null);

    const [user, setUser] = useState<User | null>();
    const [mapName, setMapName] = useState<string>('');
    const [mapDescription, setMapDescription] = useState<string>('');
    const [resource, setResource] = useState<string>(maps[8].value);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [name, setName] = useState<string>('');
    const [isInEdit, setIsInEdit] = useState(false);
    const [mapId, setMadId] = useState('na');

    useEffect(() => {
        const { edit } = router.query;
        if (edit) {
            fetch(`/api/maps/${edit}`)
                .then((response) => response.json())
                .then((response) => {
                    const map = response as Map;
                    setMapName(map.name);
                    setMapDescription(map.description);
                    setResource(map.resource);
                    setMarkers(map.markers);
                    setIsInEdit(true);
                    setMadId(map.id);
                });
        }
    }, [router]);

    // Imported from https://github.com/galexandrade/react-image-marker/blob/3290a7f4dec7145639efa63ec2e5a5ffe3218c37/src/utils/index.ts#L11 ------

    type ImagePosition = {
        top: number;
        left: number;
        width: number;
        height: number;
    };
    type MousePosition = {
        clientX: number;
        pageY: number;
    };
    const calculateMarkerPosition = (
        mousePosition: MousePosition,
        imagePosition: ImagePosition,
        scrollY: number,
        bufferLeft: number,
        bufferTop: number
    ) => {
        const pixelsLeft = mousePosition.clientX - imagePosition.left;
        let pixelsTop;
        if (imagePosition.top < 0) {
            pixelsTop = mousePosition.pageY - scrollY + imagePosition.top * -1;
        } else {
            pixelsTop = mousePosition.pageY - scrollY - imagePosition.top;
        }
        const top = ((pixelsTop - bufferTop) * 100) / imagePosition.height;
        const left = ((pixelsLeft - bufferLeft) * 100) / imagePosition.width;
        return [top, left];
    };

    // end import -------------

    const onImageClick = (event: React.MouseEvent) => {
        if (event.target.toString().includes('Button')) {
            // Ensure did not click on a button
            return;
        }

        if (nameValueRef.current && !nameValueRef.current.hidden) {
            setMarkers((prev) => {
                const next: Marker[] = [];
                prev.forEach((marker, index) => {
                    if (index != prev.length - 1) {
                        next.push(marker);
                    }
                });
                return next;
            });
            nameValueRef.current.hidden = true;
            return;
        }

        const pos = imageRef.current!.getBoundingClientRect();

        const [top, left] = calculateMarkerPosition(
            event,
            pos,
            window.scrollY,
            3,
            3
        );

        setMarkers((prev) => [
            ...prev,
            {
                id: 'blank-new-id',
                name: 'blank-new-name',
                top: top,
                left: left,
            },
        ]);

        if (nameValueRef.current) {
            nameValueRef.current.hidden = false;
        }

        if (nameRef.current) {
            nameRef.current.value = '';
            setName('');
            nameRef.current.focus();
        }
    };

    const handleCancel = () => {
        setMarkers((prev) => {
            const next: Marker[] = [];
            prev.forEach((marker, index) => {
                if (index != prev.length - 1) {
                    next.push(marker);
                }
            });
            return next;
        });
        if (nameValueRef.current) {
            nameValueRef.current.hidden = true;
        }
    };

    const handleAdd = () => {
        // Ensure name has a value
        if (!name) {
            toast({
                title: 'Location Name Required.',
                description:
                    'You need to type the name of the location in the text box above the map before trying to add it to the map.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        // Ensure name is unique
        if (!markers.every((marker) => marker.name !== name)) {
            toast({
                title: 'Location Name Must Be Unique.',
                description:
                    'The name of the location that you are trying to add has already been used for a different location on the map. Try using a different name.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setMarkers((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
                id: 'blank-new-id',
                name: name,
                top: prev[prev.length - 1].top,
                left: prev[prev.length - 1].left,
            };
            return next;
        });

        if (nameValueRef.current) {
            nameValueRef.current.hidden = true;
        }
    };

    const onMarkerClick = (value: string) => {
        if (nameValueRef.current && !nameValueRef.current.hidden) {
            // Ensure does not do anything if a location is currently being added
            if (nameRef.current) {
                nameRef.current.focus();
            }
            return;
        }

        console.log('clicked:', value);
        setMarkers((prev) => {
            const index = prev.findIndex((marker) => marker.name === value);
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setResource(event.target.value);
    };

    const handleStateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleCreateMap = (): void => {
        const markersLocal = markers;

        if (nameValueRef.current && !nameValueRef.current.hidden) {
            // Remove the blank point added if someone is in the middle of adding a location and tries to create the map
            markersLocal.splice(markersLocal.length - 1, 1);
        }

        if (!user) {
            toast({
                title: 'User Sign In Required.',
                description: 'You must sign in to create this map',
                status: 'error',
                duration: 10000,
                isClosable: true,
            });
        }

        if (!mapName) {
            toast({
                title: 'Name Required.',
                description: 'To create this map, it needs to have a name',
                status: 'error',
                duration: 10000,
                isClosable: true,
            });
        }

        if (!mapDescription) {
            toast({
                title: 'Description Required.',
                description:
                    'To create this map, it needs to have a description',
                status: 'error',
                duration: 10000,
                isClosable: true,
            });
        }

        if (markersLocal.length === 0) {
            toast({
                title: 'Locations Required.',
                description:
                    'To create this map, at least one location (point) on the map must be added',
                status: 'error',
                duration: 10000,
                isClosable: true,
            });
        }

        if (!user || !mapName || !mapDescription || markersLocal.length === 0) {
            return;
        }

        const reqBody = JSON.stringify({
            creator: user?.uid,
            description: mapDescription,
            id: mapId,
            name: mapName,
            resource: resource,
            markers: markersLocal,
        });

        if (isInEdit) {
            const reqOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: reqBody,
            };

            fetch(`/api/maps/${mapId}`, reqOptions)
                .then((response) => response.json())
                .then((_) => {
                    toast({
                        title: 'Changes Saved',
                        description: 'Your changes have been saved!',
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    Router.push({
                        pathname: `/maps/${mapId}`,
                    });
                });

            return;
        }

        const reqOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: reqBody,
        };

        fetch('/api/maps', reqOptions)
            .then((response) => response.json())
            .then((_) => {
                toast({
                    title: 'Map Created',
                    description: 'Your map has been created!',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                Router.push({ pathname: '/maps', query: { userId: user.uid } });
            });
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

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleAdd();
        } else if (event.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <NavWrapper>
            <Text mb={'1'}>
                <span style={{ fontWeight: 'bold' }}>Directions:</span> First,
                add a title and description to the map. Then select which of the
                map images you would like to use. Lastly, to add locations to
                the map. First click on the map where you would like to add a
                location. Then enter in that location's name and click the add
                button to add it to the map. To delete a location, click on the
                location you would like to delete. By hovering your mouse over a
                location on the map, a tooltip will appear showing you the
                current name of that location.
                <br />
                <br />
                You must be signed in to be able to create a map. Feel free to
                reach out to{' '}
                <Link href='https://patlm.github.io/'>Patrick</Link> if there is
                another map you would like added to the options.
            </Text>
            <Input
                fontSize={'2xl'}
                mb={'1'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setMapName(event.target.value)
                }
                placeholder={'Map Name'}
                value={mapName}
            />
            <Textarea
                mb={'1'}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setMapDescription(event.target.value)
                }
                placeholder={'Map Description'}
                value={mapDescription}
            />
            <Select marginBottom={'5'} onChange={handleChange} value={resource}>
                {maps.map((opt, index) => (
                    <option key={index} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </Select>
            <Box h={'45px'}>
                <Flex
                    ref={nameValueRef}
                    hidden={true}
                    w={'400px'}
                    alignSelf={'center'}
                >
                    <Input
                        mb={'1'}
                        onChange={handleStateChange}
                        placeholder={'Location Name'}
                        ref={nameRef}
                        onKeyDown={handleKeyDown}
                    />
                    <Button onClick={handleAdd} ml={1}>
                        Add
                    </Button>
                    <Button onClick={handleCancel} ml={1}>
                        Cancel
                    </Button>
                </Flex>
            </Box>
            <Box id='map-component-container' margin={0} padding={0}>
                <MapComponent
                    myRef={imageRef}
                    src={resource}
                    markers={markers}
                    onClick={onMarkerClick}
                    onImageClick={onImageClick}
                    showTitle={true}
                />
            </Box>
            <Button onClick={handleCreateMap}>
                {isInEdit ? 'Save Changes' : 'Create Map'}
            </Button>
        </NavWrapper>
    );
};

export default Maps;

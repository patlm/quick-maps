import {
    Box,
    Button,
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
import Router from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { Map as MapComponent } from '../components/Map';
import { NavWrapper } from '../components/NavWrapper';
import { fireClientConfig } from '../lib/fireConfig';
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

    const toast = useToast();

    const imageRef = useRef<HTMLImageElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<User | null>();
    const [mapName, setMapName] = useState<string>('');
    const [mapDescription, setMapDescription] = useState<string>('');
    const [resource, setResource] = useState<string>(maps[8].value);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [name, setName] = useState<string>('');

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

        if (event.target.toString().includes('Button')) {
            // Ensure did not click on a button
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

        console.log('added: ', name);
        setMarkers((prev) => [
            ...prev,
            {
                id: `new`,
                name: name,
                top: top,
                left: left,
            },
        ]);

        if (nameRef.current) {
            nameRef.current.value = '';
            setName('');
            nameRef.current.focus();
        }
    };

    const onMarkerClick = (value: string) => {
        console.log('clicked:', value);
        setMarkers((prev) => {
            const index = prev.findIndex((marker) => marker.name === value);
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
        if (nameRef.current) {
            nameRef.current.value = value;
            setName(value);
            nameRef.current.focus();
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setResource(event.target.value);
    };

    const handleStateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleCreateMap = (): void => {
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

        if (markers.length === 0) {
            toast({
                title: 'Locations Required.',
                description:
                    'To create this map, at least one location (point) on the map must be added',
                status: 'error',
                duration: 10000,
                isClosable: true,
            });
        }

        if (!user || !mapName || !mapDescription || markers.length === 0) {
            return;
        }

        const reqOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creator: user?.uid,
                description: mapDescription,
                id: 'na',
                name: mapName,
                resource: resource,
                markers: markers,
            }),
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

    return (
        <NavWrapper>
            <Text mb={'1'}>
                Directions: Add a title and description for the map. Add point
                name in the box above the map and click on map to the location.
                Click on a point again to delete it from the map. Two points
                with the same name are not allowed. You must be signed in to be
                able to create a map. Feel free to reach out to{' '}
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
            />
            <Textarea
                mb={'1'}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setMapDescription(event.target.value)
                }
                placeholder={'Map Description'}
            />
            <Select marginBottom={'1'} onChange={handleChange} value={resource}>
                {maps.map((opt, index) => (
                    <option key={index} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </Select>
            <Input
                mb={'1'}
                onChange={handleStateChange}
                placeholder={'Location Name'}
                ref={nameRef}
            />
            <Box id='map-component-container' margin={0} padding={0}>
                <MapComponent
                    myRef={imageRef}
                    src={resource}
                    markers={markers}
                    onClick={onMarkerClick}
                    onImageClick={onImageClick}
                />
            </Box>
            <Button onClick={handleCreateMap}>Create Map</Button>
        </NavWrapper>
    );
};

export default Maps;

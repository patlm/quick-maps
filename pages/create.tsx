import {
    Box,
    Button,
    Editable,
    EditableInput,
    EditablePreview,
    Link,
    Select,
    Text,
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

    const imageRef = useRef<HTMLImageElement>(null);

    const [user, setUser] = useState<User | null>();
    const [mapName, setMapName] = useState<string>('Map Name');
    const [mapDescription, setMapDescription] =
        useState<string>('Map Description');
    const [resource, setResource] = useState<string>(maps[8].value);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [name, setName] = useState<string>('new');

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
        // Ensure did not click on a button
        if (event.target.toString().includes('Button')) {
            return;
        }

        // Ensure name is unique
        if (!markers.every((marker) => marker.name !== name)) {
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
    };

    const onMarkerClick = (value: string) => {
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
        if (!user) {
            console.log('no user');
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
                Router.push({ pathname: '/maps' });
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
            <Text>
                Directions: Click on the title and description to change their
                values. Add point name in the box above and click on map for
                location. Click on a point again to delete it from the map. Two
                points with the same name is not allowed. You must be signed in
                to be able to create a map. Feel free to reach out to{' '}
                <Link href='https://patlm.github.io/'>Patrick</Link> if there is
                another map you would like added to the options.
            </Text>
            <Editable defaultValue={mapName} fontSize='2xl'>
                <EditablePreview display={'block'} />
                <EditableInput
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setMapName(event.target.value)
                    }
                />
            </Editable>
            <Editable defaultValue={mapDescription} marginBottom='10px'>
                <EditablePreview display={'block'} />
                <EditableInput
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setMapDescription(event.target.value)
                    }
                />
            </Editable>
            <Select
                value={resource}
                onChange={handleChange}
                marginBottom='10px'
            >
                {maps.map((opt, index) => (
                    <option key={index} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </Select>
            <Editable
                defaultValue='Point name'
                isPreviewFocusable={true}
                marginBottom='10px'
            >
                <EditablePreview minHeight='15px' display={'block'} />
                <EditableInput onChange={handleStateChange} />
            </Editable>
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

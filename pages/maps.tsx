import { Text } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { parse } from 'querystring';
import { useEffect, useState } from 'react';
import { MapCard } from '../components/MapCard';
import { NavWrapper } from '../components/NavWrapper';
import { Map } from '../models/map';

const Maps: NextPage = () => {
    const router = useRouter();
    const { asPath } = router;
    const [maps, setMaps] = useState<Map[]>([]);
    const [userId, setUserId] = useState('none');
    const [isEmpty, setIsEmpty] = useState(false);

    // Weird stuff based on: https://github.com/vercel/next.js/discussions/11484
    useEffect(() => {
        const query = parse(asPath.substring(asPath.indexOf('?') + 1));
        const search: string = query.userId as string;
        if (search) {
            setUserId(search);
        } else {
            setUserId('');
        }
    }, [router]);

    useEffect(() => {
        if (userId === 'none') {
            return;
        }

        if (!userId) {
            fetch(`/api/maps`)
                .then((response) => response.json())
                .then((response) => {
                    const maps = response as Map[];
                    setMaps([]);
                    setMaps(maps);
                });
        } else {
            fetch(`/api/maps?userId=${userId}`)
                .then((response) => response.json())
                .then((response) => {
                    const maps = response as Map[];
                    setMaps([]);
                    setMaps(maps);
                    if (maps.length === 0) {
                        setIsEmpty(true);
                    }
                });
        }
    }, [userId]);

    return (
        <NavWrapper>
            {!isEmpty ? (
                maps.map((map, index) => {
                    return <MapCard key={index} map={map} />;
                })
            ) : (
                <Text>No maps created by this user</Text>
            )}
        </NavWrapper>
    );
};

export default Maps;

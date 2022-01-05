import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { MapCard } from '../components/MapCard';
import { NavWrapper } from '../components/NavWrapper';
import { Map } from '../models/map';

const Maps: NextPage = () => {
    const [maps, setMaps] = useState<Map[]>([]);

    useEffect(() => {
        fetch(`/api/maps`)
            .then((response) => response.json())
            .then((response) => {
                const maps = response as Map[];
                setMaps([]);
                setMaps(maps);
            });
    }, []);

    return (
        <NavWrapper>
            {maps.map((map, index) => {
                return <MapCard key={index} map={map} />;
            })}
        </NavWrapper>
    );
};

export default Maps;

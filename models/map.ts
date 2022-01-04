import { Marker } from './marker';

export type Map = {
    creator: string;
    description: string;
    id: string;
    name: string;
    resource: string;
    markers: Marker[];
};

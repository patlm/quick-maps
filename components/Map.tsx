import { Box } from '@chakra-ui/react';
import React, { FC, LegacyRef } from 'react';
import { Marker } from '../models/marker';
import { MarkerButton } from './MarkerButton';

type MapProps = {
    myRef?: LegacyRef<HTMLDivElement>;
    markers: Marker[];
    src: string;
    onClick: (value: string, setCorrect: () => void) => void;
    onImageClick?: (e: React.MouseEvent) => void;
};

export const Map: FC<MapProps> = (props) => {
    return (
        <Box
            ref={props.myRef}
            bgImage={props.src}
            onClick={props.onImageClick}
            bgPos='top'
            bgSize='contain'
            bgRepeat='no-repeat'
            width='100%'
            maxWidth='1000px'
            minWidth='475px'
            display='inline-block'
            position='relative'
            _after={{
                paddingTop: '62.5%',
                display: 'block',
                content: '""',
            }}
        >
            <Box
                position='absolute'
                width='100%'
                height='100%'
                top={0}
                bottom={0}
                right={0}
                left={0}
                marginTop={0}
            >
                {props.markers.map((marker, index) => {
                    return (
                        <MarkerButton
                            key={index}
                            top={marker.top}
                            left={marker.left}
                            value={marker.name}
                            onClick={props.onClick}
                        />
                    );
                })}
            </Box>
        </Box>
    );
};

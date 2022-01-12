import { Button } from '@chakra-ui/react';
import { FC, useState } from 'react';

type MarkerButtonProps = {
    top: Number;
    left: Number;
    value: string;
    showTitle: boolean;
    onClick: (value: string, setCorrect: () => void) => void;
};

export const MarkerButton: FC<MarkerButtonProps> = (props) => {
    const [disabled, setDisabled] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('blue');

    const setCorrect = (): void => {
        setDisabled(true);
        setBackgroundColor('green');
    };

    return (
        <Button
            title={props.showTitle ? props.value : undefined}
            top={`${props.top}%`}
            left={`${props.left}%`}
            onClick={() => props.onClick(props.value, setCorrect)}
            disabled={disabled}
            backgroundColor={backgroundColor}
            size='xs'
            fontSize='xs'
            width='1%'
            height='1.65%'
            padding={0}
            margin={0}
            minWidth={0}
            display='inline-block'
            position='absolute'
            overflow='hidden'
            _hover={{
                color: backgroundColor,
                opacity: '60%',
            }}
            _disabled={{
                cursor: 'not-allowed',
                opacity: '100%',
            }}
        ></Button>
    );
};

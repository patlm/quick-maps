import {
    Button,
    Flex,
    Table,
    Tbody,
    Td,
    Tfoot,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { NavWrapper } from '../../../components/NavWrapper';
import { LeaderboardEntry } from '../../../models/leaderboardEntry';

const Finished: NextPage = () => {
    const router = useRouter();
    const { id: mapId, leaderboardEntryId } = router.query;
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        if (mapId) {
            fetch(`/api/maps/${mapId}/scores`)
                .then((response) => response.json())
                .then((data) => {
                    setEntries([]);
                    setEntries(data as LeaderboardEntry[]);
                });
        }
    }, [router]);

    const headerFooterRow = (
        <Tr>
            <Th>User</Th>
            <Th isNumeric>Missed</Th>
            <Th isNumeric>Time</Th>
            <Th isNumeric>Score</Th>
        </Tr>
    );

    return (
        <NavWrapper>
            <Flex>
                <Link href={`/maps/${mapId}`}>
                    <Button>Try Again</Button>
                </Link>
                <Button
                    ml={1}
                    onClick={() => {
                        router.reload();
                    }}
                >
                    Refresh
                </Button>
            </Flex>
            <Table size='md' maxW='1200px'>
                <Thead>{headerFooterRow}</Thead>
                <Tbody>
                    {entries.map((entry) => {
                        let bgc = 'default';
                        if (entry.id === leaderboardEntryId) {
                            bgc = 'yellow';
                        }
                        return (
                            <Tr key={entry.id} bgColor={bgc}>
                                <Td>{entry.player}</Td>
                                <Td isNumeric>{entry.incorrect}</Td>
                                <Td isNumeric>{entry.time} seconds</Td>
                                <Td isNumeric>{entry.score}</Td>
                            </Tr>
                        );
                    })}
                </Tbody>
                <Tfoot>{headerFooterRow}</Tfoot>
            </Table>
        </NavWrapper>
    );
};

export default Finished;

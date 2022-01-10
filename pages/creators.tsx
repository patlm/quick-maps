import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { NavWrapper } from '../components/NavWrapper';
import { UserCard } from '../components/UserCard';
import { User } from '../models/user';

const Maps: NextPage = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetch(`/api/users`)
            .then((response) => response.json())
            .then((response) => {
                const maps = response as User[];
                setUsers([]);
                setUsers(maps);
            });
    }, []);

    return (
        <NavWrapper>
            {users.map((user, index) => {
                return <UserCard key={index} user={user} />;
            })}
        </NavWrapper>
    );
};

export default Maps;

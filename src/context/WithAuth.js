import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const withAuth = (WrappedComponent) => {
    const AuthenticatedComponent = (props) => {
        const { currentUser } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!currentUser) {
                router.replace('/Login');
            }
        }, [currentUser, router]);

        if (!currentUser) {
            return <div>Loading...</div>; // Atau komponen loading kustom
        }

        return <WrappedComponent {...props} />;
    };

    return AuthenticatedComponent;
};

export default withAuth;
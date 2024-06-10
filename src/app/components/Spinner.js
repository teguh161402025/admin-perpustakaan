import { ProgressSpinner } from 'primereact/progressspinner';

const Spinner = () => {
    return (
        <div className="fixed top-0 left-0 z-50 w-full bg-white h-full flex justify-center items-center">
            <ProgressSpinner aria-label="Loading" />

        </div>
    );
};

export default Spinner;
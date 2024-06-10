import React, { useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';

const ToastComponent = ({ showToast, message, severity }) => {
    const toast = useRef(null);

    useEffect(() => {
        if (showToast) {
            toast.current.show({ severity, summary: severity, detail: message });
            console.log('this')
        }
    }, [showToast, message, severity]);

    return <Toast ref={toast} />;
};

export default ToastComponent;
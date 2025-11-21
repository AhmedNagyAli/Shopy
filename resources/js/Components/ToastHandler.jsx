import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

const ToastHandler = () => {
    const { props } = usePage();
    const { flash } = props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success, {
                position: 'top-right',
                duration: 4000,
            });
        }

        if (flash.error) {
            toast.error(flash.error, {
                position: 'top-right',
                duration: 5000,
            });
        }

        if (flash.warning) {
            toast(flash.warning, {
                position: 'top-right',
                duration: 4000,
                icon: '⚠️',
                style: {
                    background: '#ffc107',
                    color: '#000',
                },
            });
        }

        if (flash.info) {
            toast(flash.info, {
                position: 'top-right',
                duration: 3000,
                icon: 'ℹ️',
                style: {
                    background: '#17a2b8',
                    color: '#fff',
                },
            });
        }
    }, [flash]);

    return null;
};

export default ToastHandler;
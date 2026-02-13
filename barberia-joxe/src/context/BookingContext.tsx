
import React, { createContext, useContext, useState } from 'react';

export interface BookingState {
    step: number;
    serviceId: number | null;
    serviceName: string | null;
    servicePrice: number | null;
    stylistId: number | null;
    stylistName: string | null;
    date: Date | null;
    timeSlot: string | null;
    lockedBookingId: number | null;
}

interface BookingContextType {
    booking: BookingState;
    setService: (id: number, name: string, price: number) => void;
    setStylist: (id: number, name: string) => void;
    setTime: (date: Date, time: string) => void;
    setLockedBooking: (id: number | null) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [booking, setBooking] = useState<BookingState>({
        step: 1,
        serviceId: null,
        serviceName: null,
        servicePrice: null,
        stylistId: null,
        stylistName: null,
        date: null,
        timeSlot: null,
        lockedBookingId: null,
    });

    const setService = (id: number, name: string, price: number) => {
        setBooking(prev => ({ ...prev, serviceId: id, serviceName: name, servicePrice: price }));
    };

    const setStylist = (id: number, name: string) => {
        setBooking(prev => ({ ...prev, stylistId: id, stylistName: name }));
    };

    const setTime = (date: Date, time: string) => {
        setBooking(prev => ({ ...prev, date, timeSlot: time }));
    };

    const nextStep = () => {
        setBooking(prev => ({ ...prev, step: prev.step + 1 }));
    };

    const prevStep = () => {
        setBooking(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
    };

    const resetBooking = () => {
        setBooking({
            step: 1,
            serviceId: null,
            serviceName: null,
            servicePrice: null,
            stylistId: null,
            stylistName: null,
            date: null,
            timeSlot: null,
            lockedBookingId: null,
        });
    };

    const setLockedBooking = (id: number | null) => {
        setBooking(prev => ({ ...prev, lockedBookingId: id }));
    };

    return (
        <BookingContext.Provider value={{ booking, setService, setStylist, setTime, setLockedBooking, nextStep, prevStep, resetBooking }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};

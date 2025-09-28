import '../../css/app.css';
import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

export default function MainLayout({ children,categories }) {
    
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar categories={categories}/>
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}

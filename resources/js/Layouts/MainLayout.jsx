import '../../css/app.css';
import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Header from "../Components/Header";
export default function MainLayout({ children,categories,settings }) {
    
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar categories={categories}/>
            <Header settings={settings} />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}

import '../../css/app.css';
import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

export default function MainLayout({ children, categories, menCategories, womenCategories,topCategories }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar 
                categories={categories}
                menCategories={menCategories}
                womenCategories={womenCategories}
                topCategories={topCategories}
            />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
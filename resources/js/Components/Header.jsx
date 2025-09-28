import { Link } from "@inertiajs/react";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Header({ settings }) {
    console.log(settings);
    return (
        <header className="bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
                
                {/* Left: Logo / Site Name */}
                <Link href="/" className="flex items-center space-x-3">
                    {settings?.logo ? (
                        <img 
                            src={settings.logo} 
                            alt={settings.site_name || "Logo"}
                            className="h-10 w-auto"
                            onError={(e) => { e.currentTarget.src = '/images/logo.png'; }}
                        />
                    ) : (
                        <span className="text-2xl font-bold text-blue-600">
                            {settings?.site_name || 'Shopy'}
                        </span>
                    )}
                </Link>

                {/* Middle: Tagline */}
                {settings?.tagline && (
                    <p className="hidden md:block text-gray-500 italic">
                        {settings.tagline}
                    </p>
                )}

                {/* Right: Contact + Socials */}
                <div className="flex items-center space-x-6">
                    {/* Contact Phone */}
                    {settings?.contact_phone && (
                        <a href={`tel:${settings.contact_phone}`} 
                           className="text-sm text-gray-600 hover:text-blue-600">
                            {settings.contact_phone}
                        </a>
                    )}

                    {/* Social Links */}
                    {settings?.social_links && (
                        <div className="flex space-x-3">
                            {settings.social_links.facebook && (
                                <a href={settings.social_links.facebook} 
                                   target="_blank" rel="noreferrer"
                                   className="text-gray-500 hover:text-blue-600">
                                    <Facebook size={18} />
                                </a>
                            )}
                            {settings.social_links.twitter && (
                                <a href={settings.social_links.twitter} 
                                   target="_blank" rel="noreferrer"
                                   className="text-gray-500 hover:text-sky-500">
                                    <Twitter size={18} />
                                </a>
                            )}
                            {settings.social_links.instagram && (
                                <a href={settings.social_links.instagram} 
                                   target="_blank" rel="noreferrer"
                                   className="text-gray-500 hover:text-pink-500">
                                    <Instagram size={18} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

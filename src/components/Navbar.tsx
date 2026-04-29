'use client'

import { useState } from 'react';
import {useRouter} from "next/navigation"
import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, Home, Grid3X3, Heart, Store, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCartItems } from '@/hooks/useCart';
import { ThemeToggle } from '@/components/ThemeToggle';

const navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const Router = useRouter();
  const { user, profile, role } = useAuth();
  const { data: cartItems } = useCartItems();

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      Router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Categories', path: '/products', icon: Grid3X3 },
  ];

  return (
    <>
      {/* Main Navbar - Sticky with Glass Effect */}
      <nav className="sticky top-0 z-50 glass">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-foreground flex-shrink-0">
              Tokoku
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-10 pl-4 pr-12 glass-subtle rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <ThemeToggle />
              
              {role === 'seller' && (
                <Link href  ="/admin">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)]">
                    <Store className="w-4 h-4" />
                    Seller Center
                  </Button>
                </Link>
              )}

              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)]">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)]">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-foreground text-background text-xs font-medium rounded-full flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {user ? (
                <Link href="/profile" className="ml-2">
                  <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full glass-subtle hover:bg-[hsl(0_0%_100%/0.08)] transition-colors">
                    <Avatar className="w-7 h-7 border border-border/50">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name} />
                      <AvatarFallback className="bg-foreground/10 text-foreground text-xs">
                        {getInitials(profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground max-w-24 truncate">{profile?.name || 'My Account'}</span>
                  </div>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="bg-foreground text-background hover:opacity-90">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/cart" className="relative p-2">
                <ShoppingCart className="w-5 h-5 text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-4 h-4 px-1 bg-foreground text-background text-[10px] font-medium rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-[hsl(0_0%_100%/0.06)]"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-4 pr-12 glass-subtle rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted-foreground"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border glass animate-fade-in">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                >
                  <link.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">{link.name}</span>
                </Link>
              ))}
              
              <Link
                href="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              >
                <Heart className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Wishlist</span>
              </Link>

              {role === 'seller' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                >
                  <Store className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Seller Center</span>
                </Link>
              )}

              <div className="pt-2 border-t border-border">
                {user ? (
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                  >
                    <Avatar className="w-8 h-8 border border-border/50">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name} />
                      <AvatarFallback className="bg-foreground/10 text-foreground text-xs">
                        {getInitials(profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground">{profile?.name || 'My Account'}</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
                  >
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default navbar;

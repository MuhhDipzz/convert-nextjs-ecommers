"use client"

import { useState, useRef, useEffect } from "react";
import {
    User,
    Package,
    Heart,
    MapPin,
    CreditCard,
    Bell,
    LogOut,
    ChevronRight,
    Sun,
    Moon,
    Monitor,
    Camera,
    Loader2,
    Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link"
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    useNotificationSettings,
    useUpdateNotificationSettings,
} from "@/hooks/useNotificationSettings";

const Profile = () => {
    const { theme, setTheme } = useTheme();
    const { user, profile, role, signOut, updateProfile, requestSellerRole } =
        useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mounted, setMounted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRequestingSeller, setIsRequestingSeller] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                email: profile.email || "",
                phone: profile.phone || "",
            });
        }
    }, [profile]);

    const getInitials = (name: string | undefined) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file.",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload an image smaller than 2MB.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(filePath);

            // Update profile with new avatar URL
            const { error: updateError } = await updateProfile({
                avatar_url: publicUrl,
            });

            if (updateError) {
                throw updateError;
            }

            toast({
                title: "Avatar updated!",
                description: "Your profile picture has been changed.",
            });
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast({
                title: "Upload failed",
                description:
                    error.message || "Failed to upload avatar. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);

        try {
            const { error } = await updateProfile({
                name: formData.name,
                phone: formData.phone,
            });

            if (error) {
                throw error;
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save changes.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
            toast({
                title: "Successful",
                description: "Profile Saved!",
                variant: "default"
            })
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const handleBecomeSeller = async () => {
        setIsRequestingSeller(true);
        try {
            const { error } = await requestSellerRole();
            if (error) throw error;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to become a seller.",
                variant: "destructive",
            });
        } finally {
            setIsRequestingSeller(false);
        }
    };

    const menuItems = [
        { icon: Package, label: "Order History", path: "/orders" },
        { icon: Heart, label: "Wishlist", path: "/wishlist" },
        { icon: MapPin, label: "Addresses", path: "/profile/addresses" },
        { icon: CreditCard, label: "Payment Methods", path: "/profile/payments" },
        { icon: Bell, label: "Notifications", path: "/profile/notifications" },
    ];

    const themeOptions = [
        { value: "light", label: "Light", icon: Sun, description: "White glass" },
        { value: "dark", label: "Dark", icon: Moon, description: "Black glass" },
        {
            value: "system",
            label: "System",
            icon: Monitor,
            description: "Follow device",
        },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-12 text-foreground">
                    My Account
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="p-6 glass-card">
                            <div className="flex items-center gap-4 mb-6">
                                {/* Avatar with upload capability */}
                                <div className="relative group">
                                    <Avatar className="w-20 h-20 border-2 border-border/50">
                                        <AvatarImage
                                            src={profile?.avatar_url || undefined}
                                            alt={profile?.name}
                                        />
                                        <AvatarFallback className="bg-foreground/10 text-foreground text-xl">
                                            {getInitials(profile?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button
                                        onClick={handleAvatarClick}
                                        disabled={isUploading}
                                        className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        {isUploading ? (
                                            <Loader2 className="w-6 h-6 text-foreground animate-spin" />
                                        ) : (
                                            <Camera className="w-6 h-6 text-foreground" />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-foreground">
                                        {profile?.name || "User"}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {profile?.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                                        {role || "Buyer"}
                                    </p>
                                </div>
                            </div>

                            {/* Become a Seller Button */}
                            {role === "buyer" && (
                                <Button
                                    onClick={handleBecomeSeller}
                                    disabled={isRequestingSeller}
                                    className="w-full mb-4 gap-2 bg-foreground text-background hover:opacity-90"
                                >
                                    {isRequestingSeller ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Store className="w-4 h-4" />
                                    )}
                                    Become a Seller
                                </Button>
                            )}

                            {role === "seller" && (
                                <Link href="/admin" className="block mb-4">
                                    <Button className="w-full gap-2 bg-foreground text-background hover:opacity-90">
                                        <Store className="w-4 h-4" />
                                        Seller Dashboard
                                    </Button>
                                </Link>
                            )}

                            <div className="space-y-2">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.path}
                                        className="flex items-center justify-between p-4 rounded-xl hover:bg-[hsl(0_0%_100%/0.04)] transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            <span className="text-foreground">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </Link>
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                onClick={handleSignOut}
                                className="w-full mt-4 text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.04)] gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Theme Settings */}
                        <div className="p-6 glass-card">
                            <h3 className="text-lg font-semibold mb-6 text-foreground">
                                Appearance
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {mounted &&
                                    themeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setTheme(option.value)}
                                            className={`p-4 rounded-xl transition-all ${theme === option.value
                                                    ? "bg-foreground text-background"
                                                    : "glass-subtle hover:bg-[hsl(0_0%_100%/0.08)]"
                                                }`}
                                        >
                                            <option.icon
                                                className={`w-6 h-6 mx-auto mb-2 ${theme === option.value
                                                        ? "text-background"
                                                        : "text-muted-foreground"
                                                    }`}
                                            />
                                            <p
                                                className={`font-medium text-sm ${theme === option.value
                                                        ? "text-background"
                                                        : "text-foreground"
                                                    }`}
                                            >
                                                {option.label}
                                            </p>
                                            <p
                                                className={`text-xs mt-1 ${theme === option.value
                                                        ? "text-background/70"
                                                        : "text-muted-foreground"
                                                    }`}
                                            >
                                                {option.description}
                                            </p>
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="p-6 glass-card">
                            <h3 className="text-lg font-semibold mb-6 text-foreground">
                                Personal Information
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm text-muted-foreground mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="w-full h-12 px-4 glass-subtle rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm text-muted-foreground mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full h-12 px-4 glass-subtle rounded-xl text-muted-foreground focus:outline-none cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Email cannot be changed
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm text-muted-foreground mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        placeholder="Enter your phone number"
                                        className="w-full h-12 px-4 glass-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                className="mt-6 h-12 px-6 bg-foreground text-background hover:opacity-90 rounded-xl font-medium"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>

                        {/* Preferences - Link to full notifications page */}
                        <div className="p-6 glass-card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Preferences
                                </h3>
                                <Link href="/profile/notifications">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Manage All <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Manage your email, SMS, and newsletter preferences in the
                                notifications settings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

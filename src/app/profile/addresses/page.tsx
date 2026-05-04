"use client"

import { useState } from 'react';
import { ArrowLeft, Plus, MapPin, Pencil, Trash2, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress, Address } from '@/hooks/useAddresses';

const AddressForm = ({
    address,
    onSubmit,
    onCancel,
    isLoading
}: {
    address?: Address;
    onSubmit: (data: Omit<Address, 'id' | 'user_id' | 'created_at'>) => void;
    onCancel: () => void;
    isLoading: boolean;
}) => {
    const [formData, setFormData] = useState({
        label: address?.label || 'Home',
        recipient_name: address?.recipient_name || '',
        phone: address?.phone || '',
        address_line: address?.address_line || '',
        city: address?.city || '',
        province: address?.province || '',
        postal_code: address?.postal_code || '',
        is_default: address?.is_default || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-muted-foreground mb-2">Label</label>
                <Input
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Home, Office, etc."
                    required
                />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-2">Recipient Name</label>
                <Input
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    placeholder="Full name"
                    required
                />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-2">Phone</label>
                <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                    required
                />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-2">Address</label>
                <Input
                    value={formData.address_line}
                    onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                    placeholder="Street address"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-muted-foreground mb-2">City</label>
                    <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-2">Province</label>
                    <Input
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        placeholder="Province"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-2">Postal Code</label>
                <Input
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="Postal code"
                    required
                />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="rounded"
                />
                <span className="text-sm text-foreground">Set as default address</span>
            </label>
            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-foreground text-background hover:opacity-90">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (address ? 'Update' : 'Add Address')}
                </Button>
            </div>
        </form>
    );
};

const Addresses = () => {
    const { data: addresses, isLoading } = useAddresses();
    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();
    const deleteAddress = useDeleteAddress();
    const setDefault = useSetDefaultAddress();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const handleCreate = async (data: Omit<Address, 'id' | 'user_id' | 'created_at'>) => {
        await createAddress.mutateAsync(data);
        setIsDialogOpen(false);
    };

    const handleUpdate = async (data: Omit<Address, 'id' | 'user_id' | 'created_at'>) => {
        if (!editingAddress) return;
        await updateAddress.mutateAsync({ id: editingAddress.id, ...data });
        setEditingAddress(null);
        setIsDialogOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            await deleteAddress.mutateAsync(id);
        }
    };

    const handleSetDefault = async (id: string) => {
        await setDefault.mutateAsync(id);
    };

    const openEditDialog = (address: Address) => {
        setEditingAddress(address);
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingAddress(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-6 max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/profile">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-semibold text-foreground">Addresses</h1>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={openCreateDialog}
                            className="w-full mb-6 h-12 gap-2 bg-foreground text-background hover:opacity-90"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Address
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-border">
                        <DialogHeader>
                            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                        </DialogHeader>
                        <AddressForm
                            address={editingAddress || undefined}
                            onSubmit={editingAddress ? handleUpdate : handleCreate}
                            onCancel={() => setIsDialogOpen(false)}
                            isLoading={createAddress.isPending || updateAddress.isPending}
                        />
                    </DialogContent>
                </Dialog>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : addresses?.length === 0 ? (
                    <div className="text-center py-12 glass-card rounded-xl">
                        <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No addresses saved yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses?.map((address) => (
                            <div key={address.id} className="p-4 glass-card rounded-xl">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground">{address.label}</span>
                                        {address.is_default && (
                                            <span className="px-2 py-0.5 text-xs bg-foreground/10 text-foreground rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!address.is_default && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleSetDefault(address.id)}
                                                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                                title="Set as default"
                                            >
                                                <Star className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(address)}
                                            className="w-8 h-8 text-muted-foreground hover:text-foreground"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(address.id)}
                                            className="w-8 h-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-foreground">{address.recipient_name}</p>
                                <p className="text-sm text-muted-foreground">{address.phone}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {address.address_line}, {address.city}, {address.province} {address.postal_code}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Addresses;

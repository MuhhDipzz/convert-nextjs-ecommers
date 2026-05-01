'use client'

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartItems } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';

interface ShippingInfo {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

const Checkout = () => {
    const { data: cartItems = [] } = useCartItems();
    const createOrder = useCreateOrder();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isComplete, setIsComplete] = useState(false);
    const [orderId, setOrderId] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: ''
    });

    // Only use selected items for checkout
    const selectedItems = cartItems.filter(item => item.is_selected);
    const cartTotal = selectedItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const shippingCost = cartTotal > 500 ? 0 : 25;
    const tax = cartTotal * 0.08;
    const total = cartTotal + shippingCost + tax;

    const validateShippingInfo = (): boolean => {
        const { firstName, lastName, email, address, city, state, zip } = shippingInfo;
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
            toast({
                title: "Missing Information",
                description: "Please fill in all shipping fields.",
                variant: "destructive",
            });
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const handleContinueToReview = () => {
        if (validateShippingInfo()) {
            setStep(2);
        }
    };

    const handleCompleteOrder = async () => {
        if (selectedItems.length === 0) {
            toast({
                title: "No Items Selected",
                description: "Please select items to checkout.",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Create the actual order in the database
            const order = await createOrder.mutateAsync({
                cartItems: selectedItems,
                paymentMethod: 'cod' // Cash on Delivery
            });

            setOrderId(order.id);
            setIsComplete(true);
        } catch (error) {
            console.error('Order creation failed:', error);
            toast({
                title: "Order Failed",
                description: error instanceof Error ? error.message : "Failed to create order. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isComplete) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-background">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-foreground" />
                    </div>
                    <h1 className="text-3xl font-semibold mb-4 text-foreground">Order Confirmed!</h1>
                    <p className="text-muted-foreground mb-2">Thank you for your purchase.</p>
                    <p className="text-muted-foreground mb-8">Order #{orderId.slice(0, 8).toUpperCase()}</p>
                    <div className="flex flex-col gap-4">
                        <Link href="/orders">
                            <Button className="w-full h-12 px-8 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-medium">
                                View My Orders
                            </Button>
                        </Link>
                        <Link href="/products">
                            <Button variant="outline" className="w-full h-12 px-8 glass-subtle hover:bg-[hsl(0_0%_100%/0.08)] rounded-xl font-medium">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-background">
                <div className="text-center max-w-md mx-auto px-6">
                    <h1 className="text-2xl font-semibold mb-4 text-foreground">No items selected</h1>
                    <p className="text-muted-foreground mb-6">Please select items from your cart to checkout.</p>
                    <Link href="/cart">
                        <Button className="h-12 px-8 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-medium">
                            Go to Cart
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-6">
                <Link href="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Cart
                </Link>

                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-12 text-foreground">Checkout</h1>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-12">
                    {['Shipping', 'Review & Pay'].map((label, index) => (
                        <div key={label} className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= index + 1 ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground'
                                    }`}>
                                    {step > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
                                </div>
                                <span className={`text-sm ${step >= index + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                            </div>
                            {index < 1 && <div className="w-12 h-px bg-border" />}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        {step === 1 && (
                            <div className="space-y-6 fade-in-up">
                                <h2 className="text-xl font-semibold mb-6 text-foreground">Shipping Information</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-4 glass-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                            placeholder="John"
                                            value={shippingInfo.firstName}
                                            onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-4 glass-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                            placeholder="Doe"
                                            value={shippingInfo.lastName}
                                            onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-2">Email *</label>
                                    <input
                                        type="email"
                                        className="w-full h-12 px-4 glass-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        placeholder="john@example.com"
                                        value={shippingInfo.email}
                                        onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-2">Address *</label>
                                    <input
                                        type="text"
                                        className="w-full h-12 px-4 glass-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                        placeholder="123 Main Street"
                                        value={shippingInfo.address}
                                        onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                                    />
                                </div>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-2">City *</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-4 glass-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                            placeholder="New York"
                                            value={shippingInfo.city}
                                            onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-2">State *</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-4 glass-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                            placeholder="NY"
                                            value={shippingInfo.state}
                                            onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted-foreground mb-2">ZIP *</label>
                                        <input
                                            type="text"
                                            className="w-full h-12 px-4 glass-subtle rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                            placeholder="10001"
                                            value={shippingInfo.zip}
                                            onChange={(e) => setShippingInfo(prev => ({ ...prev, zip: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="h-14 px-8 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-medium mt-8"
                                    onClick={handleContinueToReview}
                                >
                                    Continue to Review
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 fade-in-up">
                                <h2 className="text-xl font-semibold mb-6 text-foreground">Review Your Order</h2>

                                {/* Payment Method Info */}
                                <div className="p-4 glass-subtle rounded-xl flex items-center gap-3 mb-6">
                                    <Truck className="w-5 h-5 text-foreground" />
                                    <div>
                                        <span className="text-sm font-medium text-foreground">Cash on Delivery</span>
                                        <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                                    </div>
                                </div>

                                {/* Shipping Summary */}
                                <div className="p-4 glass-subtle rounded-xl mb-6">
                                    <h3 className="text-sm font-medium text-foreground mb-2">Shipping To:</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {shippingInfo.firstName} {shippingInfo.lastName}<br />
                                        {shippingInfo.address}<br />
                                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}<br />
                                        {shippingInfo.email}
                                    </p>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4">
                                    {selectedItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-4 glass-subtle rounded-xl">
                                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                                <img src={item.product?.images?.[0] || '/placeholder.svg'} alt={item.product?.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-foreground">{item.product?.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <Button
                                        variant="outline"
                                        className="h-14 px-8 glass-subtle hover:bg-[hsl(0_0%_100%/0.08)] rounded-xl font-medium"
                                        onClick={() => setStep(1)}
                                        disabled={isProcessing}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        className="flex-1 h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-medium"
                                        onClick={handleCompleteOrder}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                                    </Button>
                                </div>

                                <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-muted/50">
                                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-muted-foreground">
                                        By placing this order, you agree to pay the total amount upon delivery. Your order will be processed and shipped to the address provided.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 p-6 glass-card">
                            <h2 className="text-lg font-semibold mb-6 text-foreground">Order Summary</h2>
                            <div className="space-y-3 mb-6">
                                {selectedItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{item.product?.name} × {item.quantity}</span>
                                        <span className="text-foreground">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 pt-4 border-t border-border mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-foreground">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span className="text-foreground">${tax.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-lg font-semibold pt-4 border-t border-border text-foreground">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

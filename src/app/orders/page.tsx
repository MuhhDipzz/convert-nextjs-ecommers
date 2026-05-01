"use client"

import { Package, ChevronRight, Truck, CheckCircle, Clock, ArrowLeft, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useOrders, Order } from '@/hooks/useOrders';
import { useAddresses } from '@/hooks/useAddresses';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Orders = () => {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: addresses = [] } = useAddresses();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-foreground" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-foreground/70" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getAddress = (addressId: string | null) => {
    if (!addressId) return null;
    return addresses.find(addr => addr.id === addressId);
  };

  const getTrackingSteps = (order: Order) => {
    const steps = [
      { label: 'Order Placed', completed: true, date: order.created_at },
      { label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(order.status), date: order.created_at },
      { label: 'Shipped', completed: ['shipped', 'delivered'].includes(order.status), date: (order as any).shipped_at },
      { label: 'Delivered', completed: order.status === 'delivered', date: (order as any).delivered_at },
    ];
    return steps;
  };

  if (ordersLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">Order History</h1>
            <p className="text-muted-foreground mt-2">{orders.length} orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">No orders yet</h2>
            <p className="text-muted-foreground mb-8">When you place an order, it will appear here.</p>
            <Link href="/products">
              <button className="h-12 px-8 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-medium transition-opacity">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className="p-6 glass-card hover:bg-[hsl(0_0%_100%/0.08)] transition-colors fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium text-foreground capitalize">
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <span className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                    <div className="w-px h-4 bg-border hidden sm:block" />
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1 text-sm text-foreground hover:opacity-70 transition-opacity"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  {order.items?.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-4">
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${Number(item.price).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="text-lg font-semibold text-foreground">${Number(order.total_price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              Order Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedOrder.status)}
                  <span className="font-medium capitalize">{getStatusLabel(selectedOrder.status)}</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <span className="text-sm text-muted-foreground">
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </span>
                <div className="w-px h-4 bg-border" />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedOrder.created_at), 'MMMM d, yyyy')}
                </span>
              </div>

              {/* Tracking Timeline */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipment Tracking
                </h3>
                
                {(selectedOrder as any).tracking_number && (
                  <div className="text-sm text-muted-foreground mb-4">
                    Tracking Number: <span className="font-mono text-foreground">{(selectedOrder as any).tracking_number}</span>
                  </div>
                )}

                <div className="relative pl-6 space-y-4">
                  {getTrackingSteps(selectedOrder).map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-6 w-3 h-3 rounded-full ${
                        step.completed ? 'bg-foreground' : 'bg-muted-foreground/30'
                      }`} />
                      {idx < 3 && (
                        <div className={`absolute -left-[18px] top-3 w-0.5 h-8 ${
                          step.completed ? 'bg-foreground/30' : 'bg-muted-foreground/20'
                        }`} />
                      )}
                      <div className="flex items-center justify-between">
                        <span className={step.completed ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                          {step.label}
                        </span>
                        {step.date && step.completed && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(step.date), 'MMM d, h:mm a')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.address_id && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  {(() => {
                    const address = getAddress(selectedOrder.address_id);
                    if (!address) return <p className="text-sm text-muted-foreground">Address not found</p>;
                    return (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="text-foreground font-medium">{address.recipient_name}</p>
                        <p>{address.address_line}</p>
                        <p>{address.city}, {address.province} {address.postal_code}</p>
                        <p>{address.phone}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method || 'N/A'}
                </p>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Items ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{item.product_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(Number(selectedOrder.total_price) - Number(selectedOrder.shipping_cost)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{Number(selectedOrder.shipping_cost) === 0 ? 'Free' : `$${Number(selectedOrder.shipping_cost).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${Number(selectedOrder.total_price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;

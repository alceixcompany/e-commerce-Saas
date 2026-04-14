'use client';

import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Order, OrderItem } from '@/types/order';
import type { GlobalSettings } from '@/types/content';

const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingBottom: 42,
        paddingHorizontal: 34,
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.45,
    },
    topBand: {
        height: 8,
        backgroundColor: '#0f172a',
        borderRadius: 999,
        marginBottom: 18,
    },
    heroCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 22,
        border: '1 solid #e2e8f0',
        marginBottom: 18,
    },
    heroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 18,
    },
    brandBlock: {
        width: '55%',
    },
    metaBlock: {
        width: '45%',
        alignItems: 'flex-end',
    },
    eyebrow: {
        fontSize: 8,
        textTransform: 'uppercase',
        letterSpacing: 2.2,
        color: '#64748b',
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 700,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 9,
        color: '#475569',
        maxWidth: 260,
    },
    siteName: {
        fontSize: 15,
        fontWeight: 700,
        marginBottom: 5,
    },
    siteLine: {
        fontSize: 9,
        color: '#475569',
        marginBottom: 2,
    },
    metaGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 18,
    },
    metaCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 14,
        border: '1 solid #e2e8f0',
    },
    metaLabel: {
        fontSize: 7,
        textTransform: 'uppercase',
        letterSpacing: 1.8,
        color: '#64748b',
        marginBottom: 5,
    },
    metaValue: {
        fontSize: 10,
        fontWeight: 700,
        color: '#0f172a',
    },
    metaMuted: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 4,
    },
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 18,
        border: '1 solid #e2e8f0',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#0f172a',
        fontWeight: 700,
    },
    sectionCaption: {
        fontSize: 8,
        color: '#64748b',
    },
    addressGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    addressPanel: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        border: '1 solid #e2e8f0',
    },
    addressName: {
        fontSize: 10,
        fontWeight: 700,
        marginBottom: 5,
    },
    addressText: {
        fontSize: 9,
        color: '#334155',
        marginBottom: 2,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottom: '1 solid #e2e8f0',
        alignItems: 'center',
    },
    colItem: {
        flex: 4.3,
        paddingRight: 12,
    },
    colQty: {
        flex: 0.9,
        textAlign: 'center',
    },
    colPrice: {
        flex: 1.4,
        textAlign: 'right',
    },
    colTotal: {
        flex: 1.5,
        textAlign: 'right',
    },
    tableHeadText: {
        fontSize: 7,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: '#334155',
        fontWeight: 700,
    },
    itemTitle: {
        fontSize: 10,
        fontWeight: 700,
        marginBottom: 3,
    },
    itemMeta: {
        fontSize: 8,
        color: '#64748b',
    },
    totalsWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 18,
        marginTop: 16,
    },
    notesPanel: {
        flex: 1.1,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        border: '1 solid #e2e8f0',
    },
    notesTitle: {
        fontSize: 8,
        textTransform: 'uppercase',
        letterSpacing: 1.6,
        color: '#64748b',
        marginBottom: 6,
        fontWeight: 700,
    },
    notesText: {
        fontSize: 8.5,
        color: '#334155',
        marginBottom: 4,
    },
    totalsPanel: {
        width: 220,
        backgroundColor: '#0f172a',
        borderRadius: 14,
        padding: 14,
    },
    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalsLabel: {
        fontSize: 8,
        color: '#cbd5e1',
        textTransform: 'uppercase',
        letterSpacing: 1.4,
    },
    totalsValue: {
        fontSize: 9,
        color: '#f8fafc',
        fontWeight: 700,
    },
    totalDivider: {
        height: 1,
        backgroundColor: '#334155',
        marginVertical: 6,
    },
    grandTotalLabel: {
        fontSize: 8,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1.8,
        marginBottom: 4,
    },
    grandTotalValue: {
        fontSize: 20,
        color: '#ffffff',
        fontWeight: 700,
    },
    footer: {
        marginTop: 6,
        paddingTop: 12,
        borderTop: '1 solid #cbd5e1',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 18,
    },
    footerText: {
        fontSize: 7.5,
        color: '#64748b',
        flex: 1,
    },
    footerStrong: {
        fontSize: 7.5,
        color: '#334155',
        fontWeight: 700,
    },
});

interface OrderReceiptProps {
    order: Order;
    globalSettings: GlobalSettings;
    currencySymbol: string;
}

const formatDate = (value?: string) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const formatMoney = (value?: number, currencySymbol?: string) =>
    `${currencySymbol || ''}${(value || 0).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getReferenceCode = (item: OrderItem) => {
    const raw = item.product || item.name;
    return raw.slice(Math.max(0, raw.length - 6)).toUpperCase();
};

const OrderReceipt = ({ order, globalSettings, currencySymbol }: OrderReceiptProps) => {
    const subtotal = order.itemsPrice || (order.totalPrice - (order.shippingPrice || 0) - (order.taxPrice || 0) + (order.coupon?.discountAmount || 0));

    return (
        <Document title={`Order Receipt ${order._id}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.topBand} />

                <View style={styles.heroCard}>
                    <View style={styles.heroRow}>
                        <View style={styles.brandBlock}>
                            <Text style={styles.eyebrow}>Payment Receipt</Text>
                            <Text style={styles.title}>Order Confirmation</Text>
                            <Text style={styles.subtitle}>
                                This receipt confirms successful payment and summarizes the fulfillment details for your order.
                            </Text>
                        </View>

                        <View style={styles.metaBlock}>
                            <Text style={styles.siteName}>{globalSettings?.siteName || 'Alceix'}</Text>
                            <Text style={styles.siteLine}>{globalSettings?.contactEmail || 'support@example.com'}</Text>
                            <Text style={styles.siteLine}>{globalSettings?.contactPhone || 'Customer Support'}</Text>
                            <Text style={styles.siteLine}>{globalSettings?.contactAddress || 'Online Storefront'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.metaGrid}>
                    <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Receipt Number</Text>
                        <Text style={styles.metaValue}>#{order._id.toUpperCase()}</Text>
                        <Text style={styles.metaMuted}>Issued {formatDate(order.createdAt)}</Text>
                    </View>
                    <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Payment Status</Text>
                        <Text style={styles.metaValue}>{order.isPaid ? 'Paid' : 'Pending'}</Text>
                        <Text style={styles.metaMuted}>{order.paymentMethod || 'Online Payment'}</Text>
                    </View>
                    <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Transaction ID</Text>
                        <Text style={styles.metaValue}>{order.paymentResult?.id || 'Processing'}</Text>
                        <Text style={styles.metaMuted}>Updated {formatDate(order.paidAt || order.updatedAt)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Billing & Delivery</Text>
                        <Text style={styles.sectionCaption}>Customer and shipping details</Text>
                    </View>

                    <View style={styles.addressGrid}>
                        <View style={styles.addressPanel}>
                            <Text style={styles.addressName}>{order.shippingAddress?.fullName || 'Customer'}</Text>
                            <Text style={styles.addressText}>{order.shippingAddress?.address || '-'}</Text>
                            <Text style={styles.addressText}>
                                {order.shippingAddress?.district || '-'}, {order.shippingAddress?.city || '-'}
                            </Text>
                            <Text style={styles.addressText}>{order.shippingAddress?.postalCode || '-'}</Text>
                            <Text style={styles.addressText}>{order.shippingAddress?.phone || '-'}</Text>
                        </View>

                        <View style={styles.addressPanel}>
                            <Text style={styles.addressName}>Order Status</Text>
                            <Text style={styles.addressText}>Fulfillment: {order.status || 'received'}</Text>
                            <Text style={styles.addressText}>Paid At: {formatDate(order.paidAt || order.createdAt)}</Text>
                            <Text style={styles.addressText}>Delivered At: {formatDate(order.deliveredAt)}</Text>
                            <Text style={styles.addressText}>Tracking: {order.trackingNumber || 'Not assigned yet'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Items</Text>
                        <Text style={styles.sectionCaption}>{order.orderItems.length} line item(s)</Text>
                    </View>

                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeadText, styles.colItem]}>Product</Text>
                        <Text style={[styles.tableHeadText, styles.colQty]}>Qty</Text>
                        <Text style={[styles.tableHeadText, styles.colPrice]}>Unit</Text>
                        <Text style={[styles.tableHeadText, styles.colTotal]}>Amount</Text>
                    </View>

                    {order.orderItems.map((item, index) => (
                        <View key={`${item.product}-${index}`} style={styles.tableRow}>
                            <View style={styles.colItem}>
                                <Text style={styles.itemTitle}>{item.name}</Text>
                                <Text style={styles.itemMeta}>SKU Ref: {getReferenceCode(item)}</Text>
                            </View>
                            <Text style={styles.colQty}>{item.qty}</Text>
                            <Text style={styles.colPrice}>{formatMoney(item.price, currencySymbol)}</Text>
                            <Text style={styles.colTotal}>{formatMoney(item.price * item.qty, currencySymbol)}</Text>
                        </View>
                    ))}

                    <View style={styles.totalsWrap}>
                        <View style={styles.notesPanel}>
                            <Text style={styles.notesTitle}>Notes</Text>
                            <Text style={styles.notesText}>
                                Payment has been recorded successfully for this order.
                            </Text>
                            <Text style={styles.notesText}>
                                For support, contact {globalSettings?.contactEmail || 'support@example.com'} with your receipt number.
                            </Text>
                            {order.coupon?.code ? (
                                <Text style={styles.notesText}>Promotion applied: {order.coupon.code}</Text>
                            ) : null}
                        </View>

                        <View style={styles.totalsPanel}>
                            <View style={styles.totalsRow}>
                                <Text style={styles.totalsLabel}>Subtotal</Text>
                                <Text style={styles.totalsValue}>{formatMoney(subtotal, currencySymbol)}</Text>
                            </View>
                            {order.coupon?.discountAmount ? (
                                <View style={styles.totalsRow}>
                                    <Text style={styles.totalsLabel}>Discount</Text>
                                    <Text style={styles.totalsValue}>-{formatMoney(order.coupon.discountAmount, currencySymbol)}</Text>
                                </View>
                            ) : null}
                            <View style={styles.totalsRow}>
                                <Text style={styles.totalsLabel}>Shipping</Text>
                                <Text style={styles.totalsValue}>{formatMoney(order.shippingPrice, currencySymbol)}</Text>
                            </View>
                            <View style={styles.totalsRow}>
                                <Text style={styles.totalsLabel}>Tax</Text>
                                <Text style={styles.totalsValue}>{formatMoney(order.taxPrice, currencySymbol)}</Text>
                            </View>
                            <View style={styles.totalDivider} />
                            <Text style={styles.grandTotalLabel}>Total Paid</Text>
                            <Text style={styles.grandTotalValue}>{formatMoney(order.totalPrice, currencySymbol)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This receipt was generated electronically by {globalSettings?.siteName || 'our store'} and is valid without signature.
                    </Text>
                    <Text style={styles.footerStrong}>
                        Verification ID: {order.paymentResult?.id || order._id}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default OrderReceipt;

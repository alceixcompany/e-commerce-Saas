'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a clean font if possible, otherwise use standard fonts
// For simplicity and robustness during generation, we'll use Helvetica
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#18181b', // zinc-900
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderBottomColor: '#f4f4f5', // zinc-100
        paddingBottom: 20,
        marginBottom: 30,
    },
    titleSection: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -1,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 8,
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#a1a1aa', // zinc-400
    },
    merchantInfo: {
        textAlign: 'right',
    },
    merchantName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    merchantAddress: {
        fontSize: 8,
        color: '#71717a', // zinc-500
        lineHeight: 1.4,
    },
    registrySection: {
        flexDirection: 'row',
        marginBottom: 30,
        gap: 40,
    },
    registryBlock: {
        flex: 1,
    },
    label: {
        fontSize: 7,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: '#71717a',
        marginBottom: 4,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    addressBlock: {
        marginBottom: 30,
        backgroundColor: '#fafafa',
        padding: 15,
        borderRadius: 8,
    },
    addressText: {
        fontSize: 9,
        lineHeight: 1.5,
        color: '#27272a',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 30,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottom: 1,
        borderBottomColor: '#18181b',
        paddingBottom: 8,
        marginBottom: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: 1,
        borderBottomColor: '#f4f4f5',
        paddingVertical: 10,
        alignItems: 'center',
    },
    colDesc: { flex: 4 },
    colQty: { flex: 1, textAlign: 'center' },
    colPrice: { flex: 1.5, textAlign: 'right' },
    colTotal: { flex: 1.5, textAlign: 'right' },
    itemTitle: { fontSize: 9, fontWeight: 'bold' },
    itemSubtitle: { fontSize: 7, color: '#a1a1aa', marginTop: 2 },
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalsContainer: {
        width: 200,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTop: 1,
        borderTopColor: '#18181b',
    },
    grandTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTop: 1,
        borderTopColor: '#f4f4f5',
        paddingTop: 20,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 7,
        color: '#a1a1aa',
        textAlign: 'center',
        lineHeight: 1.5,
    }
});

interface OrderReceiptProps {
    order: any;
    globalSettings: any;
    currencySymbol: string;
}

const OrderReceipt = ({ order, globalSettings, currencySymbol }: OrderReceiptProps) => {
    return (
        <Document title={`Receipt - ${order._id}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleSection}>
                        <Text style={styles.subtitle}>Official Documentation</Text>
                        <Text style={styles.title}>RECEIPT</Text>
                    </View>
                    <View style={styles.merchantInfo}>
                        <Text style={styles.merchantName}>{globalSettings?.siteName || 'Alceix Company'}</Text>
                        <Text style={styles.merchantAddress}>High-Density Commerce Division</Text>
                        <Text style={styles.merchantAddress}>{globalSettings?.contactEmail || 'operations@alceix.com'}</Text>
                    </View>
                </View>

                {/* Registry Data */}
                <View style={styles.registrySection}>
                    <View style={styles.registryBlock}>
                        <Text style={styles.label}>Registry Hash</Text>
                        <Text style={styles.value}>#{order._id.toUpperCase()}</Text>
                    </View>
                    <View style={styles.registryBlock}>
                        <Text style={styles.label}>Authorization Date</Text>
                        <Text style={styles.value}>{new Date(order.createdAt).toLocaleDateString([], { dateStyle: 'long' })}</Text>
                    </View>
                    <View style={styles.registryBlock}>
                        <Text style={styles.label}>Payment Protocol</Text>
                        <Text style={styles.value}>{order.paymentMethod?.toUpperCase() || 'SECURE_GATEWAY'}</Text>
                    </View>
                </View>

                {/* Shipping Info */}
                <View style={styles.addressBlock}>
                    <Text style={styles.label}>Destination Log</Text>
                    <Text style={[styles.addressText, { fontWeight: 'bold', marginBottom: 4 }]}>
                        {order.shippingAddress?.fullName || 'Anonymous Client'}
                    </Text>
                    <Text style={styles.addressText}>{order.shippingAddress?.address}</Text>
                    <Text style={styles.addressText}>
                        {order.shippingAddress?.district}, {order.shippingAddress?.city} {order.shippingAddress?.postalCode}
                    </Text>
                    <Text style={styles.addressText}>{order.shippingAddress?.phone}</Text>
                </View>

                {/* Artifact Ledger (Table) */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.label, styles.colDesc]}>Artifact Description</Text>
                        <Text style={[styles.label, styles.colQty]}>Qty</Text>
                        <Text style={[styles.label, styles.colPrice]}>Unit Price</Text>
                        <Text style={[styles.label, styles.colTotal]}>Total</Text>
                    </View>
                    {order.orderItems.map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={styles.colDesc}>
                                <Text style={styles.itemTitle}>{item.name}</Text>
                                <Text style={styles.itemSubtitle}>REF: ALX-{item.product.substring(item.product.length - 6).toUpperCase()}</Text>
                            </View>
                            <Text style={[styles.value, styles.colQty]}>{item.qty}</Text>
                            <Text style={[styles.value, styles.colPrice]}>{currencySymbol}{item.price.toLocaleString()}</Text>
                            <Text style={[styles.value, styles.colTotal]}>{currencySymbol}{(item.qty * item.price).toLocaleString()}</Text>
                        </View>
                    ))}
                </View>

                {/* Fiscal Breakdown */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsContainer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.label}>Subtotal</Text>
                            <Text style={styles.value}>{currencySymbol}{(order.itemsPrice || (order.totalPrice - (order.shippingPrice || 0) - (order.taxPrice || 0) + (order.coupon?.discountAmount || 0))).toLocaleString()}</Text>
                        </View>
                        {order.coupon && (
                            <View style={styles.totalRow}>
                                <Text style={[styles.label, { color: '#16a34a' }]}>Incentive ({order.coupon.code})</Text>
                                <Text style={[styles.value, { color: '#16a34a' }]}>-{currencySymbol}{order.coupon.discountAmount.toLocaleString()}</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.label}>Logistics Fee</Text>
                            <Text style={styles.value}>{currencySymbol}{order.shippingPrice?.toLocaleString() || '0'}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.label}>Registry Duty</Text>
                            <Text style={styles.value}>{currencySymbol}{order.taxPrice?.toLocaleString() || '0'}</Text>
                        </View>
                        <View style={styles.grandTotalRow}>
                            <Text style={[styles.label, { fontSize: 9, color: '#18181b' }]}>Total Settlement</Text>
                            <Text style={styles.grandTotalValue}>{currencySymbol}{order.totalPrice.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This is a computer-generated document issued by {globalSettings?.siteName || 'Alceix Company'}'s central registry server.
                    </Text>
                    <Text style={styles.footerText}>
                        Verification Timestamp: {new Date().toISOString()} | Trace ID: {order.paymentResult?.id || 'AUTH_PENDING'}
                    </Text>
                    <Text style={[styles.footerText, { marginTop: 10, fontWeight: 'bold' }]}>
                        THANK YOU FOR YOUR PARTNERSHIP
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default OrderReceipt;

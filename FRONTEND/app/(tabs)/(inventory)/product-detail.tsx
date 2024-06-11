import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function productdetail() {
    const navigation = useNavigation();
    const { productId } = useLocalSearchParams();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<any>(null);

    useEffect(() => {
        fetchProductDetails();
    }, []);

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`http://192.168.186.16:5000/api/product/product/${productId}`);
            setProduct(response.data);
            setQrCodeUrl(`http://192.168.186.16:5000/api/product/qr/${productId}`);
            setLoading(false);
        } catch (error) {
            setError('Error fetching product details');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!product) {
        return null;
    }

    const discountedPrice = product.price - (product.price * product.discount.percentage) / 100;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image 
                source={{ uri: `http://192.168.186.16:5000/api/product/images/${encodeURIComponent(product.name)}` }} 
                style={styles.image} 
                onError={(e) => console.error(e.nativeEvent.error)}
            />
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.description}>{product.description}</Text>
            {product.discount.percentage > 0 ? (
                <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>₹{product.price.toFixed(2)}</Text>
                    <Text style={styles.discountedPrice}>₹{discountedPrice.toFixed(2)}</Text>
                </View>
            ) : (
                <Text style={styles.price}>Price: ₹{product.price.toFixed(2)}</Text>
            )}
            <Text style={styles.quantity}>Quantity: {product.quantity}</Text>
            {product.discount.percentage > 0 && (
                <Text style={styles.discount}>
                    Discount: {product.discount.percentage}% until {new Date(product.discount.expiresAt).toLocaleDateString()}
                </Text>
            )}
            {qrCodeUrl && (
                <Image 
                    source={{ uri: qrCodeUrl }} 
                    style={styles.qrCode} 
                    onError={(e) => console.error(e.nativeEvent.error)}
                />
            )}
            <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('edit-product-detail', { productId: product._id })}>
                <Ionicons name="pencil-outline" size={24} color="white" />
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 10,
        marginBottom: 16,
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        marginBottom: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    originalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        textDecorationLine: 'line-through',
        color: 'gray',
        marginRight: 8,
    },
    discountedPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    quantity: {
        fontSize: 16,
        marginBottom: 8,
    },
    discount: {
        fontSize: 16,
        color: 'red',
        marginBottom: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrCode: {
        width: 200,
        height: 200,
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        backgroundColor: '#1A1A1A',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
});
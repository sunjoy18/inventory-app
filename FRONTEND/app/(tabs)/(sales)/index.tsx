import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { ThemedImage } from '@/components/ThemedImage';
import { Ionicons } from '@expo/vector-icons';

type Discount = {
    percentage: number;
    expiresAt?: Date;
};

type Product = {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    discount: Discount;
};

type Sale = {
    productId: string; // Schema.Types.ObjectId is represented as string in TypeScript
    productName: string;
    quantity: number;
    totalPrice: number;
    date: Date;
    _id: string;
};

export default function SalesScreen() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [filterDate, setFilterDate] = useState<string>('');
    const [uniqueDates, setUniqueDates] = useState<string[]>([]);
    const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

    useEffect(() => {
        fetchSales();
    }, [selectedDate, !filterDate]);

    useEffect(() => {
        extractUniqueDates();
    }, [sales]);

    const fetchSales = async () => {
        try {
            const response = await axios.get<Sale[]>(`http://192.168.186.16:5000/api/product/sales`, {
                params: { date: selectedDate }
            });
            setSales(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSale = async () => {
        if (filterDate) {
            try {
                const response = await axios.get<Sale[]>(`http://192.168.186.16:5000/api/product/sale/${filterDate}`);
                setSales(response.data);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const extractUniqueDates = () => {
        const dates: string[] = [];
        sales.forEach(item => {
            const itemDate = new Date(item.date).toDateString();
            if (!dates.includes(itemDate)) {
                dates.push(itemDate);
            }
        });
        setUniqueDates(dates);
    };

    const calculateTotalSale = (date: string): string => {
        const total = sales.reduce((acc, sale) => {
            if (new Date(sale.date).toDateString() === date) {
                return acc + sale.totalPrice;
            }
            return acc;
        }, 0);
        return total.toFixed(2);
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sales</Text>
                <Ionicons
                    name={isFilterVisible ? 'funnel-sharp' : 'funnel-outline'}
                    size={24}
                    color={'black'}
                    onPress={toggleFilterVisibility}
                />
            </View>
            {isFilterVisible && (
                <View style={styles.filterContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Select Date (YYYY-MM-DD)"
                        value={filterDate}
                        onChangeText={setFilterDate}
                    />
                    <TouchableOpacity style={styles.filterButton} onPress={fetchSale}>
                        <Text style={styles.filterButtonText}>APPLY</Text>
                    </TouchableOpacity>
                </View>
            )}
            <FlatList
                data={uniqueDates}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View>
                        <View style={styles.dateContainer}>
                            <Text style={styles.date}>{item}</Text>
                            <Text style={styles.totalSale}>
                                ₹{calculateTotalSale(item)}
                            </Text>
                        </View>
                        {sales.filter(sale => new Date(sale.date).toDateString() === item).map(sale => (
                            <View style={styles.saleItem} key={sale._id}>
                                <View style={styles.saleDetails}>
                                    <View style={styles.textContainer}>
                                        <Text style={{ fontWeight: 'bold' }}>{sale.productName} x {sale.quantity}</Text>
                                        <Text>Total Price: ₹{sale.totalPrice}</Text>
                                    </View>
                                    <View>
                                        <ThemedImage
                                            source={{ uri: `http://192.168.186.16:5000/api/product/images/${encodeURIComponent(sale.productName)}` }}
                                        />
                                        <Text style={styles.time}>{new Date(sale.date).toLocaleTimeString()}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            />
            <TouchableOpacity style={styles.floatingButton} onPress={fetchSales}>
                <Ionicons name="refresh-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        marginRight: 10,
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    date: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalSale: {
        fontSize: 16,
        color: 'green',
    },
    saleItem: {
        marginBottom: 10,
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
    },
    saleDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    time: {
        fontSize: 12,
        color: '#666',
    },
    filterButton: {
        backgroundColor: '#28A745',
        padding: 15,
        borderRadius: 5,
    },
    filterButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
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

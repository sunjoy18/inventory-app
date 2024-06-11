import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, View, FlatList, TouchableOpacity, ActivityIndicator, Text, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigation } from 'expo-router';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  discount?: {
    percentage: number;
    expiresAt?: Date;
  };
};

export default function TabTwoScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.186.16:5000/api/product/allProducts');
      setProducts(response.data);
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching products');
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('product-detail', { productId: item._id })}>
      <View style={styles.itemContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.name}</Text>
          <Text>Price: ₹{item.price.toFixed(2)}</Text>
        </View>
        <Image source={{ uri: `http://192.168.186.16:5000/api/product/images/${encodeURIComponent(item.name)}` }} style={styles.image} onError={(e) => console.error(e.nativeEvent.error)} />
      </View>
    </TouchableOpacity>
  );

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

  return (
    <View style={styles.container}>
      <Text style={styles.inventoryTitle}>Inventory</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
      />
      <TouchableOpacity style={styles.floatingButton} onPress={fetchProducts}>
        <Ionicons name="refresh-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        marginTop: 30,
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        margin: 10,
        borderRadius: 5,
        marginTop: 15,
    },
    item: {
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        borderWidth: 1,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inventoryTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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

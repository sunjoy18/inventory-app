import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/ctx';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams } from 'expo-router';
import { ThemedImage } from '@/components/ThemedImage';

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

type CartItem = Product & { quantityWanted: number, id: string };

export default function CartScreen() {
  const { signOut } = useSession();

  const navigation = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch products from the API
    axios.get('http://192.168.186.16:5000/api/product/allProducts')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const addToCart = (product: Product) => {
    const existingCartItem = cart.find(item => item._id === product._id);
    if (existingCartItem) {
      const updatedCart = cart.map(item =>
        item._id === product._id ? { ...item, quantityWanted: item.quantityWanted + 1 } : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantityWanted: 1, id: product._id  }]);
    }
  };

  const incrementQuantity = (productId: string) => {
    const updatedCart = cart.map(item =>
      item._id === productId ? { ...item, quantityWanted: item.quantityWanted + 1 } : item
    );
    setCart(updatedCart);
  };

  const decrementQuantity = (productId: string) => {
    const updatedCart = cart.map(item =>
      item.id === productId && item.quantityWanted > 1
        ? { ...item, quantityWanted: item.quantityWanted - 1 }
        : item
    );
    setCart(updatedCart);
  };

  const updateProductQuantity = async (id: string, quantity: number) => {
    try {
      const response = await axios.put(`http://192.168.186.16:5000/api/product/update-quantity/${id}`, { quantity });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const calculateTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantityWanted, 0).toFixed(2);
  };

  const handleCheckout = async () => {
    for (const item of cart) {
      try {
        await axios.post('http://192.168.186.16:5000/api/product/add-sale', {
          productId: item._id,
          productName: item.name,
          quantity: item.quantityWanted,
          totalPrice: item.price * item.quantityWanted
        });
        await updateProductQuantity(item._id, item.quantity - item.quantityWanted);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to complete checkout');
      }
    }
    setCart([]);
    Alert.alert('Success', 'Checkout completed successfully');

  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  };

  const route = useRoute();

  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (route.params && route.params.scannedProduct) {
      setScannedProduct(route.params.scannedProduct);
      addToCart(route.params.scannedProduct);
    }
  }, [route.params]);

  return (
    <View style={styles.container}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>Cart</Text>
        <ThemedText
          onPress={() => {
            // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
            signOut();
          }}>
          <Ionicons name={'log-out-outline'} size={24} color="#F4002A"></Ionicons>
        </ThemedText>

      </View>

      {selectedProduct && (
        <View style={styles.productDetailContainer}>
          <Text style={styles.productDetailName}>{selectedProduct.name}</Text>
          <Text>{selectedProduct.description}</Text>
          <Text>₹{selectedProduct.price}</Text>
          <Text>Available Quantity: {selectedProduct.quantity}</Text>
          <ThemedImage
            source={{ uri: `http://192.168.186.16:5000/api/product/images/${encodeURIComponent(selectedProduct.name)}` }}
            style={styles.productImage}
          />
          {selectedProduct.discount && selectedProduct.discount.percentage > 0 && (
            <Text>Discount: {selectedProduct.discount.percentage}%</Text>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addToCart(selectedProduct)}
          >
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* <Text style={styles.inventoryTitle}>Current Cart</Text> */}
      <FlatList
        data={cart}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.productContainer} key={item.name}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.productName}>{item.name}</Text>
                <Text>{item.description}</Text>
                <Text>₹{item.price}</Text>
              </View>
              <ThemedImage
                source={{ uri: `http://192.168.186.16:5000/api/product/images/${encodeURIComponent(item.name)}` }}
                style={styles.productImage}
              />
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => decrementQuantity(item.id)}>
                <Ionicons name="remove-circle-outline" size={24} color="red" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantityWanted}</Text>
              <TouchableOpacity onPress={() => incrementQuantity(item._id)}>
                <Ionicons name="add-circle-outline" size={24} color="green" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.totalAmount}>Total Amount: ₹{calculateTotalAmount()}</Text>

      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Checkout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.scannerFloatingButton} onPress={() => navigation.navigate('qr-scanner-screen')}>
        <Ionicons name="scan-outline" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.searchFloatingButton} onPress={() => setSearchModalVisible(true)}>
        <Ionicons name="search-outline" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={searchModalVisible}
        animationType="slide"
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.productContainer} key={item.name}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text>₹{item.price}</Text>
                  </View>
                  <ThemedImage
                    source={{ uri: `http://192.168.186.16:5000/api/product/images/${encodeURIComponent(item.name)}` }}
                    style={styles.productImage}
                  />
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    addToCart(item);
                    setSearchModalVisible(false);
                  }}
                >
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <Button title="Close" onPress={() => setSearchModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productDetailContainer: {
    marginBottom: 20,
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  productDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productContainer: {
    marginBottom: 20,
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productImage: {
    width: 50,
    aspectRatio: 1 / 1,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  checkoutButton: {
    marginTop: 20,
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scannerFloatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 50,
  },
  searchFloatingButton: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 50,
  },
  inventoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

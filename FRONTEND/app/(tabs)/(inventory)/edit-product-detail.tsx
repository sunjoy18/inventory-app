import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

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

export default function EditProductScreen() {
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountDays, setDiscountDays] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://192.168.186.16:5000/api/product/product/${productId}`);
      const data = response.data;
      setProduct(data);
      setName(data.name);
      setDescription(data.description);
      setPrice(data.price.toString());
      setQuantity(data.quantity.toString());
      setDiscountPercentage(data.discount?.percentage.toString() || '');
      setDiscountDays(data.discount?.expiresAt ? calculateDiscountDays(data.discount.expiresAt) : '');
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountDays = (expiresAt: Date) => {
    const currentDate = new Date();
    const expirationDate = new Date(expiresAt);
    const diffTime = expirationDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays.toString() : '';
  };

  const handleEditProduct = async () => {
    if (isNaN(parseFloat(price)) || isNaN(parseInt(quantity))) {
      setMessage('Please enter valid numeric values for price and quantity.');
      return;
    }

    const editedProduct = {
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      discount: {
        percentage: parseInt(discountPercentage) || 0,
        expiresAt: discountDays ? new Date(Date.now() + parseInt(discountDays) * 24 * 60 * 60 * 1000) : undefined
      }
    };

    try {
      await axios.put(`http://192.168.186.16:5000/api/product/edit/${productId}`, editedProduct);
      setMessage('Product updated successfully');
      fetchProduct(); // Refresh the product data after update
    } catch (error) {
      console.error('Error editing product:', error);
      setMessage('Error updating product');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product && (
        <>
          <Image
            source={{ uri: `http://192.168.186.16:5000/api/product/images/${encodeURIComponent(product.name)}` }}
            style={styles.image}
            onError={(e) => console.error('Error loading image', e.nativeEvent.error)}
          />
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Price:</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantity:</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Discount Percentage:</Text>
            <TextInput
              style={styles.input}
              value={discountPercentage}
              onChangeText={setDiscountPercentage}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Discount Duration (days):</Text>
            <TextInput
              style={styles.input}
              value={discountDays}
              onChangeText={setDiscountDays}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleEditProduct}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          <Text style={styles.message}>{message}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        marginRight: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 8,
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    message: {
        marginTop: 10,
        color: 'green',
        textAlign: 'center',
    },
});

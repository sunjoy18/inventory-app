import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountDays, setDiscountDays] = useState('');
  const [imageUri, setImageUri] = useState<any>(null);
  const [qrCodeImage, setQrCodeImage] = useState<any>(null);
  const [message, setMessage] = useState('');

  const handleAddProduct = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('discountPercentage', discountPercentage);
    formData.append('discountDays', discountDays);
    if (imageUri) {
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'product-image.jpg'
      });
    }

    try {
      const response = await axios.post('http://192.168.186.16:5000/api/product/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob' // Set responseType to 'blob' to receive binary data
      });
      // Check if the response is JSON (error case)
      if (response.data.message == 'A product with the same name already exists') {
        setMessage('A product with the same name already exists');
      } else {
        // Handle the QR code image response
        const reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onloadend = () => {
          setQrCodeImage(reader.result);
        };
        setMessage('Product added successfully');
        // Clear form after successful submission
        setName('');
        setDescription('');
        setPrice('');
        setQuantity('');
        setDiscountPercentage('');
        setDiscountDays('');
        setImageUri(null);
      }
    } catch (err) {
      setMessage('Error occurred');
    }
  };

  const addMoreProduct = () => {
    setQrCodeImage(null)
  }

  const pickImage = async () => {
    let response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (response.assets && response.assets.length > 0) {
      setImageUri(response.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Product</Text>
      {!qrCodeImage &&
        <>
          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Discount Percentage"
            value={discountPercentage}
            onChangeText={setDiscountPercentage}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Discount Duration (days)"
            value={discountDays}
            onChangeText={setDiscountDays}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Pick Image</Text>
          </TouchableOpacity>

          {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

          <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>
        </>
      }


      {qrCodeImage && (
        <View style={{ display: 'flex', alignItems: 'center' }}>
          {/* Display QR code image */}
          <Image source={{ uri: qrCodeImage }} style={styles.qrCode} />
          {/* Error or success message */}
          {message ? <Text>{message}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={addMoreProduct}>
            <Text style={styles.buttonText}>Add More Product</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
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
  link: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#1E90FF',
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginTop: 12,
  },
  urlText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#1E90FF',
  },
});

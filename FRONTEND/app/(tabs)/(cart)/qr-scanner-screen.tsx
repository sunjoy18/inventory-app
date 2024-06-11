// screens/QRScannerScreen.tsx
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { CameraView, Camera } from "expo-camera";
import axios from 'axios';
import { useNavigation } from "expo-router";

export default function QRScannerScreen() {
    const navigation = useNavigation();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState<boolean>(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        setScanned(true);
        try {
            const response = await axios.get(`http://192.168.186.16:5000/api/product/product/${data}`);
            navigation.navigate('index', { scannedProduct: response.data });
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch product details');
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Scanner</Text>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "pdf417"],
                }}
                style={styles.cameraContainer}
            />
            {scanned && (
                <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: 'center',
    },
    title: {
        marginBottom: 10,
        fontWeight: 'bold',
    },
    cameraContainer: {
        width: '90%',
        aspectRatio: 1 / 1,
        borderRadius: 5,
        marginBottom: 20
    }
});
